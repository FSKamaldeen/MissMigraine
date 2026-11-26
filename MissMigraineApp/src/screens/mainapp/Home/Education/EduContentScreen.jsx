import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { supabase } from '../../../../lib/supabase';

// ─────────────────────────────────────────────────────
// Inline hook — fetch all published articles
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

        const enriched = (data || []).map((article) => {
          const plainText = (article.content || '').replace(/<[^>]*>/g, ' ');
          const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
          const minutes = Math.max(1, Math.round(wordCount / 200));
          return {
            ...article,
            readTime: `${minutes} min read`,
            categoryLabel: (article.category || 'general').replace(/_/g, ' '),
          };
        });

        setArticles(enriched);
      } catch (err) {
        if (cancelled) return;
        console.log('Error fetching articles:', err);
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
// Inline card component
// ─────────────────────────────────────────────────────

function FullArticleCard({ article, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-4 flex-row items-center justify-between rounded-[24px] bg-surface p-5 active:opacity-70"
    >
      <View className="flex-1 pr-4">
        <Text className="mb-2 font-plein-medium text-[10px] uppercase tracking-wider text-brand">
          {article.categoryLabel}
        </Text>

        <Text
          className="mb-2 font-plein-medium text-base leading-6 text-text-primary"
          numberOfLines={2}
        >
          {article.title}
        </Text>

        <View className="flex-row items-center gap-1.5">
          <MaterialCommunityIcons name="clock-outline" size={14} color="#c8b0e8" />
          <Text className="font-plein text-sm text-text-muted">
            {article.readTime}
          </Text>
        </View>
      </View>

      <View className="h-8 w-8 items-center justify-center rounded-full">
        <MaterialCommunityIcons name="chevron-right" size={28} color="#ad89dc" />
      </View>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function EducationalContentScreen({ navigation }) {
  const { articles, loading, error } = useEducationalContent();

  const handleArticlePress = (article) => {
    navigation.navigate('EducationalArticle', { articleId: article.id });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            className="mb-4 self-start"
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
          <Text className="font-reem text-4xl text-text-primary">Learn</Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            Guides about cycle, triggers, and self-care
          </Text>
        </View>

        <View className="px-6 mt-2">
          {/* Loading */}
          {loading && (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#ad89dc" />
              <Text className="mt-4 font-plein text-sm text-text-muted">
                Loading articles...
              </Text>
            </View>
          )}

          {/* Error */}
          {!loading && error && (
            <View className="rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-6 items-center">
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={32}
                color="#472376"
              />
              <Text className="mt-3 text-center font-plein-medium text-base text-text-primary">
                Couldn't load articles
              </Text>
              <Text className="mt-1 text-center font-plein text-sm text-text-muted">
                Please check your connection and try again.
              </Text>
            </View>
          )}

          {/* Empty state */}
          {!loading && !error && articles.length === 0 && (
            <View className="rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-6 items-center">
              <MaterialCommunityIcons
                name="book-open-outline"
                size={32}
                color="#472376"
              />
              <Text className="mt-3 text-center font-plein-medium text-base text-text-primary">
                No articles yet
              </Text>
              <Text className="mt-1 text-center font-plein text-sm text-text-muted">
                Check back soon for new guides and resources.
              </Text>
            </View>
          )}

          {/* Articles list */}
          {!loading && !error && articles.length > 0 &&
            articles.map((article) => (
              <FullArticleCard
                key={article.id}
                article={article}
                onPress={() => handleArticlePress(article)}
              />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}