import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export interface AppCollection {
  id: string;
  AppName: string;
  iconURL?: string;
  Tags?: string[];
  AverageRating?: number;
  Price?: number;
  TrustScore?: number;
  ReviewCount?: number;
  PublicationDate?: any;
  CompatibleAssets?: string[];
  RecommendedAssets?: string[];
  [key: string]: any; // Allow other properties
}

/**
 * In typical app stores, collections are calculated using various algorithms:
 * 
 * 1. **Featured Apps**: Manually curated by editors or algorithmically selected based on:
 *    - Editorial picks
 *    - High trust scores
 *    - Recent promotional campaigns
 *    - Seasonal relevance
 * 
 * 2. **Recommended Apps**: Personalized recommendations based on:
 *    - User's connected apps (collaborative filtering)
 *    - User's assets and their compatibility
 *    - Similar users' preferences
 *    - Machine learning models predicting user interest
 * 
 * 3. **Recently Added**: Simple time-based query:
 *    - Apps sorted by publication date (newest first)
 * 
 * 4. **Popular/Essential Apps**: Based on engagement metrics:
 *    - Download/connection count
 *    - High ratings (4+ stars)
 *    - High review count
 *    - User retention rate
 * 
 * 5. **Trending Apps**: Time-weighted popularity:
 *    - Recent download velocity (downloads in last 7/30 days)
 *    - Rising star apps (new apps gaining traction)
 *    - Social sharing metrics
 * 
 * For now, we'll implement simplified versions that can be enhanced later.
 */

// Fetch featured apps - high trust score and ratings
export async function getFeaturedApps(limitCount: number = 10): Promise<AppCollection[]> {
  try {
    const appsRef = collection(db, 'Apps');
    const appsSnapshot = await getDocs(appsRef);
    
    const apps = appsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppCollection))
      .filter(app => 
        (app.TrustScore || 0) >= 70 && 
        (app.AverageRating || 0) >= 4.0
      )
      .sort((a, b) => (b.TrustScore || 0) - (a.TrustScore || 0))
      .slice(0, limitCount);
    
    return apps;
  } catch (error) {
    console.error('Error fetching featured apps:', error);
    return [];
  }
}

// Fetch recently added apps
export async function getRecentlyAddedApps(limitCount: number = 10): Promise<AppCollection[]> {
  try {
    const appsRef = collection(db, 'Apps');
    const appsSnapshot = await getDocs(appsRef);
    
    const apps = appsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppCollection))
      .sort((a, b) => {
        const dateA = a.PublicationDate?.toDate?.() || new Date(0);
        const dateB = b.PublicationDate?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limitCount);
    
    return apps;
  } catch (error) {
    console.error('Error fetching recently added apps:', error);
    return [];
  }
}

// Fetch recommended apps based on user's assets
export async function getRecommendedApps(
  userAssets: string[] = [],
  limitCount: number = 10
): Promise<AppCollection[]> {
  try {
    const appsRef = collection(db, 'Apps');
    const appsSnapshot = await getDocs(appsRef);
    
    if (userAssets.length === 0) {
      // If no user assets, return top-rated apps
      const apps = appsSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AppCollection))
        .sort((a, b) => (b.AverageRating || 0) - (a.AverageRating || 0))
        .slice(0, limitCount);
      
      return apps;
    }
    
    // Calculate compatibility score for each app
    const apps = appsSnapshot.docs
      .map(doc => {
        const appData = doc.data() as AppCollection;
        const compatibleAssets = appData.CompatibleAssets || [];
        const recommendedAssets = appData.RecommendedAssets || [];
        
        // Score based on how many user assets are compatible
        const compatibilityScore = userAssets.reduce((score, assetId) => {
          if (compatibleAssets.includes(assetId)) return score + 2;
          if (recommendedAssets.includes(assetId)) return score + 1;
          return score;
        }, 0);
        
        return {
          ...appData,
          id: doc.id,
          compatibilityScore
        };
      })
      .filter(app => app.compatibilityScore && app.compatibilityScore > 0)
      .sort((a, b) => {
        const scoreA = a.compatibilityScore || 0;
        const scoreB = b.compatibilityScore || 0;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return (b.AverageRating || 0) - (a.AverageRating || 0);
      })
      .slice(0, limitCount) as AppCollection[];
    
    return apps;
  } catch (error) {
    console.error('Error fetching recommended apps:', error);
    return [];
  }
}

// Fetch essential/popular apps - high ratings and review count
export async function getEssentialApps(limitCount: number = 10): Promise<AppCollection[]> {
  try {
    const appsRef = collection(db, 'Apps');
    const appsSnapshot = await getDocs(appsRef);
    
    const apps = appsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppCollection))
      .filter(app => 
        (app.AverageRating || 0) >= 4.0 && 
        (app.ReviewCount || 0) >= 5
      )
      .sort((a, b) => {
        // Sort by weighted score: rating * log(review count)
        const scoreA = (a.AverageRating || 0) * Math.log10((a.ReviewCount || 0) + 1);
        const scoreB = (b.AverageRating || 0) * Math.log10((b.ReviewCount || 0) + 1);
        return scoreB - scoreA;
      })
      .slice(0, limitCount);
    
    return apps;
  } catch (error) {
    console.error('Error fetching essential apps:', error);
    return [];
  }
}

// Fetch apps by category
export async function getAppsByCategory(
  category: string,
  limitCount: number = 20
): Promise<AppCollection[]> {
  try {
    const appsRef = collection(db, 'Apps');
    const appsSnapshot = await getDocs(appsRef);
    
    const apps = appsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppCollection))
      .filter(app => 
        app.Tags && app.Tags.some((tag: string) => 
          tag.toLowerCase().includes(category.toLowerCase())
        )
      )
      .slice(0, limitCount);
    
    return apps;
  } catch (error) {
    console.error('Error fetching apps by category:', error);
    return [];
  }
}
