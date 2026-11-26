import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { supabase } from '../../../../lib/supabase';

// ─────────────────────────────────────────────────────
// Content parser — handles HTML content
// ─────────────────────────────────────────────────────

function parseContentToParagraphs(content) {
  if (!content) return [];

  // Check if the content contains HTML tags
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);

  if (!hasHtml) {
    // Plain text — split by double newlines or single newlines
    return content
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  // HTML content — extract text from <p>, <h2>, <h3>, <li> tags
  const blocks = [];
  
  // Match headings and paragraphs, and list items
  const tagRegex = /<(h[1-6]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[1].toLowerCase();
    const innerHtml = match[2];
    
    // Strip any remaining nested tags from the inner content
    const text = innerHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (text) {
      blocks.push({ tag, text });
    }
  }

  // Fallback: if no block tags were found, strip everything and split by newlines
  if (blocks.length === 0) {
    return content
      .replace(/<[^>]*>/g, '\n')
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((text) => ({ tag: 'p', text }));
  }

  return blocks;
}

// ─────────────────────────────────────────────────────
// Inline hook — fetch a single article by id
// ─────────────────────────────────────────────────────

function useEducationalArticle(articleId) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      setError('No article selected');
      return;
    }

    let cancelled = false;

    const fetchArticle = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('educational_content')
          .select('id, title, content, category, updated_at, created_at')
          .eq('id', articleId)
          .eq('is_published', true)
          .maybeSingle();

        if (cancelled) return;

        if (fetchError) throw fetchError;
        if (!data) {
          setError('Article not found');
          setArticle(null);
          return;
        }

        // Derive read time from the plain text content
        const plainText = (data.content || '').replace(/<[^>]*>/g, ' ');
        const wordCount = plainText.trim().split(/\s+/).length;
        const minutes = Math.max(1, Math.round(wordCount / 200));

        setArticle({
          ...data,
          readTime: `${minutes} min read`,
          lastUpdated: new Date(data.updated_at || data.created_at).toLocaleDateString(
            'en-US',
            { month: 'short', day: 'numeric', year: 'numeric' }
          ),
        });
      } catch (err) {
        if (cancelled) return;
        console.log('Error fetching article:', err);
        setError(err.message || 'Could not load article');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchArticle();

    return () => {
      cancelled = true;
    };
  }, [articleId]);

  return { article, loading, error };
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function EducationalArticleScreen({ navigation, route }) {
  const articleId = route.params?.articleId;
  const { article, loading, error } = useEducationalArticle(articleId);

  // Shared header
  const Header = () => (
    <View className="px-6 pt-4 pb-6">
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={12}
        className="mb-4 self-start"
      >
        <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
      </Pressable>
    </View>
  );

  // Loading
  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <Header />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ad89dc" />
          <Text className="mt-4 font-plein text-sm text-text-muted">
            Loading article...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error / not found
  if (error || !article) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <Header />
        <View className="flex-1 items-center justify-center px-6">
          <MaterialCommunityIcons
            name="file-document-outline"
            size={48}
            color="#472376"
          />
          <Text className="mt-4 text-center font-reem text-2xl text-text-primary">
            Article not found
          </Text>
          <Text className="mt-2 text-center font-plein text-sm text-text-muted">
            {error || 'This article may have been removed or is no longer available.'}
          </Text>
          <Pressable
            onPress={() => navigation.goBack()}
            className="mt-6 items-center rounded-full bg-brand px-6 py-3 active:bg-brand-dark"
          >
            <Text className="font-plein-medium text-sm text-text-inverse">
              Go back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Success
  const blocks = parseContentToParagraphs(article.content);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <View className="px-6 mt-2">
          
          {/* Title */}
          <Text
            className="mb-4 font-reem text-4xl text-text-primary"
            style={{ lineHeight: 48 }}
          >
            {article.title}
          </Text>

          {/* Meta row */}
          <View className="mb-8 flex-row items-center gap-4 border-b border-elevated pb-6">
            <View className="flex-row items-center gap-1.5">
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color="#ad89dc"
              />
              <Text className="font-plein text-sm text-text-muted">
                {article.readTime}
              </Text>
            </View>
            <View className="h-1 w-1 rounded-full bg-elevated" />
            <Text className="font-plein text-sm text-text-muted">
              Updated {article.lastUpdated}
            </Text>
          </View>

          {/* Body */}
          <View className="mb-8">
            {blocks.map((block, index) => {
              if (block.tag === 'h2') {
                return (
                  <Text
                    key={index}
                    className="mb-3 mt-6 font-reem text-2xl text-text-primary"
                  >
                    {block.text}
                  </Text>
                );
              }
              if (block.tag === 'h3') {
                return (
                  <Text
                    key={index}
                    className="mb-2 mt-5 font-reem text-xl text-text-primary"
                  >
                    {block.text}
                  </Text>
                );
              }
              if (block.tag === 'li') {
                return (
                  <View key={index} className="mb-3 flex-row items-start gap-3">
                    <View className="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
                    <Text className="flex-1 font-plein text-base leading-7 text-text-primary">
                      {block.text}
                    </Text>
                  </View>
                );
              }
              // Default: paragraph
              return (
                <Text
                  key={index}
                  className="mb-5 font-plein text-base leading-8 text-text-primary"
                >
                  {block.text}
                </Text>
              );
            })}
          </View>

          {/* Disclaimer */}
          <Text className="text-center font-plein text-xs leading-5 text-text-muted opacity-80">
            This content is for informational purposes and isn't a substitute
            for medical advice. Always talk to your doctor about your care.
          </Text>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}