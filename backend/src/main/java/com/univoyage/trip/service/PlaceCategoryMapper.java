package com.univoyage.trip.service;

import java.util.List;

/**
 * Maps Geoapify place categories and names to user-friendly category names.
 * Provides comprehensive categorization to avoid generic "Attraction" or "Historic Site" defaults.
 */
public class PlaceCategoryMapper {

    /**
     * Extract category from place properties
     * @param categories List of category strings from Geoapify API
     * @param placeName Name of the place
     * @param historicType Historic type from API (e.g., "castle", "monument")
     * @param description Description text (may contain category keywords)
     * @return User-friendly category name
     */
    public static String extractCategory(List<String> categories, String placeName, String historicType, String description) {
        String nameLower = placeName != null ? placeName.toLowerCase() : "";
        String historicTypeLower = historicType != null ? historicType.toLowerCase() : "";
        String descLower = description != null ? description.toLowerCase() : "";
        
        // Priority 1: Check historic.type field (very reliable indicator)
        if (!historicTypeLower.isEmpty()) {
            String historicBasedCategory = getCategoryFromHistoricType(historicTypeLower);
            if (historicBasedCategory != null) {
                return historicBasedCategory;
            }
        }
        
        // Priority 2: Check place name for specific keywords
        String nameBasedCategory = getCategoryFromName(nameLower);
        if (nameBasedCategory != null) {
            return nameBasedCategory;
        }
        
        // Priority 3: Check description for keywords
        if (!descLower.isEmpty()) {
            String descBasedCategory = getCategoryFromDescription(descLower);
            if (descBasedCategory != null) {
                return descBasedCategory;
            }
        }

        // Priority 4: Check categories list
        if (categories != null && !categories.isEmpty()) {
            String categoryBased = getCategoryFromList(categories);
            if (categoryBased != null) {
                return categoryBased;
            }
        }

        // Default fallback
        return "Attraction";
    }
    
    /**
     * Extract category from historic.type field
     */
    private static String getCategoryFromHistoricType(String historicType) {
        if (historicType.contains("castle") || historicType.contains("palace") ||
            historicType.contains("château") || historicType.contains("schloss") ||
            historicType.contains("palazzo") || historicType.contains("manor")) {
            return "Castle";
        }
        
        if (historicType.contains("fort") || historicType.contains("fortress") ||
            historicType.contains("citadel")) {
            return "Fort";
        }
        
        if (historicType.contains("tower")) {
            return "Tower";
        }
        
        if (historicType.contains("monument") || historicType.contains("memorial")) {
            return "Monument";
        }
        
        if (historicType.contains("city_gate") || historicType.contains("gate")) {
            return "City Gate";
        }
        
        if (historicType.contains("church") || historicType.contains("cathedral") ||
            historicType.contains("basilica") || historicType.contains("temple") ||
            historicType.contains("mosque") || historicType.contains("synagogue") ||
            historicType.contains("chapel") || historicType.contains("abbey") ||
            historicType.contains("monastery") || historicType.contains("convent") ||
            historicType.contains("shrine") || historicType.contains("sanctuary")) {
            return "Religious Site";
        }
        
        return null;
    }
    
    /**
     * Extract category from description text
     */
    private static String getCategoryFromDescription(String descLower) {
        // Check for castle/palace in description
        if (descLower.contains("castle") || descLower.contains("palace") ||
            descLower.contains("château") || descLower.contains("schloss") ||
            descLower.contains("palazzo") || descLower.contains("manor")) {
            return "Castle";
        }
        
        // Check for museum
        if (descLower.contains("museum") || descLower.contains("gallery") ||
            descLower.contains("collection") || descLower.contains("exhibition")) {
            return "Museum";
        }
        
        // Check for religious sites
        if (isReligiousName(descLower)) {
            return "Religious Site";
        }
        
        // Check for fort
        if (descLower.contains("fort") || descLower.contains("fortress") ||
            descLower.contains("citadel")) {
            return "Fort";
        }
        
        // Check for tower
        if (descLower.contains("tower") || descLower.contains("minaret")) {
            return "Tower";
        }
        
        // Check for monument
        if (descLower.contains("monument") || descLower.contains("memorial") ||
            descLower.contains("statue") || descLower.contains("obelisk")) {
            return "Monument";
        }
        
        return null;
    }

    /**
     * Extract category by analyzing the place name
     */
    private static String getCategoryFromName(String nameLower) {
        // Religious sites (check first as they're very specific)
        if (isReligiousName(nameLower)) {
            return "Religious Site";
        }
        
        // Museums
        if (nameLower.contains("museum") || nameLower.contains("gallery") || 
            nameLower.contains("collection") || nameLower.contains("exhibition")) {
            return "Museum";
        }
        
        // Castles and Palaces
        if (nameLower.contains("castle") || nameLower.contains("palace") || 
            nameLower.contains("château") || nameLower.contains("schloss") ||
            nameLower.contains("palazzo")) {
            return "Castle";
        }
        
        // Forts and Fortresses (separate from castles)
        if (nameLower.contains("fort") || nameLower.contains("fortress") || 
            nameLower.contains("citadel")) {
            return "Fort";
        }
        
        // Towers
        if (nameLower.contains("tower") || nameLower.contains("bell tower") ||
            nameLower.contains("clock tower") || nameLower.contains("minaret")) {
            return "Tower";
        }
        
        // Squares and Plazas
        if (nameLower.contains("square") || nameLower.contains("plaza") ||
            nameLower.contains("platz") || nameLower.contains("piazza") ||
            nameLower.contains("trg") || nameLower.contains("place")) {
            return "Square";
        }
        
        // Parks and Gardens
        if (nameLower.contains("park") || nameLower.contains("garden") ||
            nameLower.contains("botanical") || nameLower.contains("zoo") ||
            nameLower.contains("nature reserve")) {
            return "Park";
        }
        
        // Monuments and Memorials
        if (nameLower.contains("monument") || nameLower.contains("memorial") ||
            nameLower.contains("statue") || nameLower.contains("obelisk") ||
            nameLower.contains("cenotaph")) {
            return "Monument";
        }
        
        // Bridges
        if (nameLower.contains("bridge") || nameLower.contains("viaduct")) {
            return "Landmark";
        }
        
        // Theaters and Opera Houses
        if (nameLower.contains("theater") || nameLower.contains("theatre") ||
            nameLower.contains("opera") || nameLower.contains("concert hall")) {
            return "Attraction";
        }
        
        // Markets
        if (nameLower.contains("market") || nameLower.contains("bazaar")) {
            return "Attraction";
        }
        
        // Beaches
        if (nameLower.contains("beach") || nameLower.contains("coast")) {
            return "Attraction";
        }
        
        return null; // No match found
    }

    /**
     * Extract category from Geoapify categories list
     */
    private static String getCategoryFromList(List<String> categories) {
        // Process categories in order of specificity (most specific first)
        for (String category : categories) {
            String categoryLower = category.toLowerCase();
            
            // Religious sites
            if (isReligiousCategory(categoryLower)) {
                return "Religious Site";
            }
            
            // Castles and Palaces
            if (categoryLower.contains("castle") || categoryLower.contains("palace")) {
                return "Castle";
            }
            
            // Forts and Fortresses
            if (categoryLower.contains("fort") || categoryLower.contains("fortress") ||
                categoryLower.contains("citadel")) {
                return "Fort";
            }
            
            // Museums
            if (categoryLower.contains("museum") || categoryLower.contains("gallery")) {
                return "Museum";
            }
            
            // Towers
            if (categoryLower.contains("tower") || categoryLower.contains("minaret")) {
                return "Tower";
            }
            
            // Squares
            if (categoryLower.contains("square") || categoryLower.contains("plaza")) {
                return "Square";
            }
            
            // Parks and Gardens
            if (categoryLower.contains("park") || categoryLower.contains("garden") ||
                categoryLower.contains("zoo") || categoryLower.contains("nature")) {
                return "Park";
            }
            
            // Monuments and Memorials
            if (categoryLower.contains("monument") || categoryLower.contains("memorial")) {
                return "Monument";
            }
            
            // Artwork and Sculptures
            if (categoryLower.contains("artwork") || categoryLower.contains("sculpture") ||
                categoryLower.contains("art")) {
                return "Artwork";
            }
            
            // City Gates
            if (categoryLower.contains("city_gate") || categoryLower.contains("gate")) {
                return "City Gate";
            }
            
            // Bridges
            if (categoryLower.contains("bridge")) {
                return "Landmark";
            }
            
            // Beaches
            if (categoryLower.contains("beach") || categoryLower.contains("coast")) {
                return "Attraction";
            }
            
            // Theaters
            if (categoryLower.contains("theater") || categoryLower.contains("theatre") ||
                categoryLower.contains("opera")) {
                return "Attraction";
            }
            
            // Markets
            if (categoryLower.contains("market") || categoryLower.contains("bazaar")) {
                return "Attraction";
            }
            
            // Historic sites (only if no more specific category found)
            if (categoryLower.contains("historic") && !categoryLower.contains("castle") &&
                !categoryLower.contains("monument") && !categoryLower.contains("tower")) {
                // Try to be more specific about historic sites
                if (categoryLower.contains("building")) {
                    return "Historic Site";
                }
            }
            
            // Sights and Landmarks (generic, use as fallback)
            if (categoryLower.contains("sights") && !hasMoreSpecificCategory(categories, category)) {
                return "Landmark";
            }
        }
        
        return null; // No match found
    }

    /**
     * Check if a category string represents a religious site
     */
    private static boolean isReligiousCategory(String category) {
        return category.contains("church") || 
               category.contains("cathedral") || 
               category.contains("religious") ||
               category.contains("shrine") ||
               category.contains("basilica") ||
               category.contains("temple") ||
               category.contains("mosque") ||
               category.contains("synagogue") ||
               category.contains("chapel") ||
               category.contains("abbey") ||
               category.contains("monastery") ||
               category.contains("convent") ||
               category.contains("sanctuary") ||
               category.contains("place_of_worship");
    }

    /**
     * Check if a place name represents a religious site
     */
    private static boolean isReligiousName(String name) {
        return name.contains("cathedral") ||
               name.contains("shrine") ||
               name.contains("basilica") ||
               name.contains("temple") ||
               name.contains("mosque") ||
               name.contains("synagogue") ||
               name.contains("chapel") ||
               name.contains("abbey") ||
               name.contains("monastery") ||
               name.contains("convent") ||
               name.contains("sanctuary") ||
               name.contains("church") ||
               (name.contains("st.") && (name.contains("cathedral") || name.contains("church"))) ||
               (name.contains("saint") && (name.contains("cathedral") || name.contains("church"))) ||
               (name.contains("santa") && (name.contains("maria") || name.contains("cathedral"))) ||
               (name.contains("notre") && name.contains("dame"));
    }

    /**
     * Check if there's a more specific category in the list
     */
    private static boolean hasMoreSpecificCategory(List<String> categories, String currentCategory) {
        String current = currentCategory.toLowerCase();
        for (String cat : categories) {
            String catLower = cat.toLowerCase();
            // If we find a more specific category, return true
            if (!catLower.equals(current) && 
                (catLower.contains("castle") || catLower.contains("museum") ||
                 catLower.contains("tower") || catLower.contains("monument") ||
                 catLower.contains("religious") || catLower.contains("church"))) {
                return true;
            }
        }
        return false;
    }
}

