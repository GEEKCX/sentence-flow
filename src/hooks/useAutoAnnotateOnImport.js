import { useState, useCallback, useRef } from 'react';

export function useAutoAnnotateOnImport() {
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotationProgress, setAnnotationProgress] = useState({ current: 0, total: 0 });
  const isCancelledRef = useRef(false);

  const cancelAnnotation = useCallback(() => {
    isCancelledRef.current = true;
  }, []);

  const annotateImportedSentences = useCallback(async (sentences, options = {}) => {
    const { onProgress } = options;
    setIsAnnotating(true);
    setAnnotationProgress({ current: 0, total: sentences.length });
    isCancelledRef.current = false;

    try {
      // Dynamic import to avoid loading dictionary if not needed
      const { enrichSentencesWithECDict } = await import('../utils/sentenceEnricher');
      
      const enriched = await enrichSentencesWithECDict(sentences, (current, total) => {
        if (isCancelledRef.current) {
          throw new Error('Annotation cancelled');
        }
        setAnnotationProgress({ current, total });
        if (onProgress) {
          onProgress(current, total);
        }
      });
      
      return enriched;
    } catch (error) {
      if (error.message === 'Annotation cancelled') {
        console.log('Annotation process was cancelled by user');
        return null; // Or return partially enriched data if possible? 
                     // enrichSentencesWithECDict doesn't return partial data on error.
                     // So we return null to signal cancellation.
      }
      console.error('Auto annotation failed:', error);
      throw error;
    } finally {
      setIsAnnotating(false);
    }
  }, []);

  return {
    annotateImportedSentences,
    isAnnotating,
    annotationProgress,
    cancelAnnotation
  };
}
