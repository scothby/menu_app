import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
    if (!measurementId) {
        console.warn('GA4 Measurement ID not provided');
        return;
    }

    ReactGA.initialize(measurementId, {
        gaOptions: {
            anonymizeIp: true, // GDPR compliance
        },
    });

    console.log('Google Analytics initialized');
};

// Track page views
export const trackPageView = (path: string) => {
    ReactGA.send({ hitType: 'pageview', page: path });
};

// Generic event tracking
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
    ReactGA.event(eventName, params);
};

// === Core Feature Tracking ===

/**
 * Track menu scan/analysis
 */
export const trackMenuScan = (params: {
    dishCount: number;
    mode: 'visualizer' | 'nutrition';
    languageDetected?: string;
    restaurantName?: string;
}) => {
    trackEvent('menu_scanned', {
        dish_count: params.dishCount,
        mode: params.mode,
        language_detected: params.languageDetected || 'unknown',
        restaurant_name: params.restaurantName || 'unknown',
    });
};

/**
 * Track dish translation
 */
export const trackTranslation = (params: {
    dishName: string;
    fromLanguage: string;
    toLanguage: string;
    autoTranslate?: boolean;
}) => {
    trackEvent('dish_translated', {
        dish_name: params.dishName,
        from_language: params.fromLanguage,
        to_language: params.toLanguage,
        auto_translate: params.autoTranslate || false,
    });
};

/**
 * Track recipe generation
 */
export const trackRecipeGeneration = (params: {
    dishName: string;
    difficulty?: string;
}) => {
    trackEvent('recipe_generated', {
        dish_name: params.dishName,
        difficulty: params.difficulty || 'unknown',
    });
};

/**
 * Track chat/concierge usage
 */
export const trackChatInteraction = (params: {
    action: 'opened' | 'message_sent' | 'closed';
    messageCount?: number;
    sessionDuration?: number;
}) => {
    if (params.action === 'opened') {
        trackEvent('chat_opened', {});
    } else if (params.action === 'message_sent') {
        trackEvent('chat_message_sent', {
            message_count: params.messageCount || 0,
        });
    } else if (params.action === 'closed') {
        trackEvent('chat_closed', {
            session_duration: params.sessionDuration || 0,
        });
    }
};

/**
 * Track bill splitter usage
 */
export const trackBillSplit = (params: {
    peopleCount: number;
    totalAmount?: number;
    itemsCount?: number;
}) => {
    trackEvent('bill_split', {
        people_count: params.peopleCount,
        total_amount: params.totalAmount || 0,
        items_count: params.itemsCount || 0,
    });
};

/**
 * Track language change
 */
export const trackLanguageChange = (params: {
    fromLanguage: string;
    toLanguage: string;
}) => {
    trackEvent('language_changed', {
        from_language: params.fromLanguage,
        to_language: params.toLanguage,
    });
};

/**
 * Track favorite actions
 */
export const trackFavorite = (params: {
    action: 'added' | 'removed';
    dishName: string;
}) => {
    trackEvent('favorite_action', {
        action: params.action,
        dish_name: params.dishName,
    });
};

/**
 * Track dish card share
 */
export const trackShare = (params: {
    dishName: string;
    method?: string;
}) => {
    trackEvent('dish_shared', {
        dish_name: params.dishName,
        share_method: params.method || 'unknown',
    });
};

/**
 * Track image generation
 */
export const trackImageGeneration = (params: {
    dishName: string;
    success: boolean;
    errorMessage?: string;
}) => {
    if (params.success) {
        trackEvent('image_generated', {
            dish_name: params.dishName,
        });
    } else {
        trackError({
            errorType: 'image_generation_failed',
            errorMessage: params.errorMessage || 'Unknown error',
            context: params.dishName,
        });
    }
};

/**
 * Track errors
 */
export const trackError = (params: {
    errorType: string;
    errorMessage: string;
    context?: string;
}) => {
    trackEvent('error_occurred', {
        error_type: params.errorType,
        error_message: params.errorMessage,
        context: params.context || 'unknown',
    });
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (params: {
    featureName: string;
    action?: string;
}) => {
    trackEvent('feature_used', {
        feature_name: params.featureName,
        action: params.action || 'used',
    });
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, any>) => {
    ReactGA.set(properties);
};

export default {
    initGA,
    trackPageView,
    trackEvent,
    trackMenuScan,
    trackTranslation,
    trackRecipeGeneration,
    trackChatInteraction,
    trackBillSplit,
    trackLanguageChange,
    trackFavorite,
    trackShare,
    trackImageGeneration,
    trackError,
    trackFeatureUsage,
    setUserProperties,
};
