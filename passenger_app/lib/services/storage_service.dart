import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const String _favoritesKey = 'railpredict_favorites';
  static const String _recentSearchesKey = 'railpredict_recent_searches';

  // Memory caches for rapid responsive UI
  static final Set<String> _cachedFavorites = {'12627', '20607'};
  static final List<Map<String, String>> _cachedRecentSearches = [
    {
      'train_number': '12627',
      'train_name': 'Karnataka Express',
      'route': 'MAS → SBC',
    },
    {
      'train_number': '20607',
      'train_name': 'Vande Bharat Express',
      'route': 'MAS → SBC',
    },
    {
      'train_number': '12007',
      'train_name': 'Shatabdi Express',
      'route': 'MAS → SBC',
    },
  ];

  static Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final favList = prefs.getStringList(_favoritesKey);
      if (favList != null) {
        _cachedFavorites.clear();
        _cachedFavorites.addAll(favList);
      }

      final recentList = prefs.getStringList(_recentSearchesKey);
      if (recentList != null) {
        _cachedRecentSearches.clear();
        for (var item in recentList) {
          _cachedRecentSearches.add(Map<String, String>.from(jsonDecode(item)));
        }
      }
    } catch (_) {}
  }

  static bool isFavorite(String trainNumber) {
    return _cachedFavorites.contains(trainNumber);
  }

  static Future<void> toggleFavorite(String trainNumber) async {
    if (_cachedFavorites.contains(trainNumber)) {
      _cachedFavorites.remove(trainNumber);
    } else {
      _cachedFavorites.add(trainNumber);
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_favoritesKey, _cachedFavorites.toList());
    } catch (_) {}
  }

  static Set<String> getFavorites() {
    return _cachedFavorites;
  }

  static List<Map<String, String>> getRecentSearches() {
    return _cachedRecentSearches;
  }

  static Future<void> addRecentSearch(
      String trainNumber, String trainName, String route) async {
    _cachedRecentSearches.removeWhere((item) => item['train_number'] == trainNumber);
    _cachedRecentSearches.insert(0, {
      'train_number': trainNumber,
      'train_name': trainName,
      'route': route,
    });

    if (_cachedRecentSearches.length > 8) {
      _cachedRecentSearches.removeLast();
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      final stringList =
          _cachedRecentSearches.map((item) => jsonEncode(item)).toList();
      await prefs.setStringList(_recentSearchesKey, stringList);
    } catch (_) {}
  }
}
