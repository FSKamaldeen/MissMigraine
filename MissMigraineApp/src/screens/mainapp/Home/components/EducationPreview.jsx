import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { supabase } from '../../../../lib/supabase';

// ─────────────────────────────────────────────────────
// Inline hook — fetch published articles
// ─────────────────────────────────────────────────────

function useEducationalContent() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchArticles = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('educational_content')
          .select('id, title, content, category, updated_at, created_at')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (cancelled) return;

        if (fetchError) throw fetchError;

        // Derive read time from the plain text content
        const enriched = (data || []).map((article) => {
          const plainText = (article.content || '').replace(/<[^>]*>/g, ' ');
          const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
          const minutes = Math.max(1, Math.round(wordCount / 200));
          return {
            ...article,
            readTime: `${minutes} min read`,
          };
        });

        setArticles(enriched);
      } catch (err) {
        if (cancelled) return;
        console.log('Error fetching educational content:', err);
        setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchArticles();

    return () => {
      cancelled = true;
    };
  }, []);

  return { articles, loading, error };
}

// ─────────────────────────────────────────────────────
// Inline components
// ─────────────────────────────────────────────────────

function ArticleCard({ article, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[200px] min-h-[140px] justify-between rounded-2xl bg-surface p-5 active:opacity-80"
    >
      <Text
        className="mb-2 font-plein-medium text-base leading-6 text-text-primary"
        numberOfLines={3}
      >
        {article.title}
      </Text>

      <Text className="font-plein text-sm text-text-muted">
        {article.readTime}
      </Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────

export default function EducationPreview({ onViewAll, onArticlePress }) {
  const { articles, loading, error } = useEducationalContent();

  // Only show the first 4 in the preview
  const previewArticles = articles.slice(0, 4);

  // Hide the whole section if there's nothing to show
  if (!loading && (error || articles.length === 0)) {
    return null;
  }

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between px-6">
        <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
          Helpful resources
        </Text>
        
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text className="font-reem text-xs uppercase tracking-wider text-text-primary">
            View all
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="h-[140px] items-center justify-center">
          <ActivityIndicator size="small" color="#ad89dc" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
        >
          {previewArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onPress={() => onArticlePress?.(article)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}