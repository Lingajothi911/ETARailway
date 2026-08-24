import 'package:flutter/material.dart';
import '../models/train_models.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import 'train_details_screen.dart';
import 'station_board_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _trainSearchController = TextEditingController();
  final TextEditingController _fromStationController =
      TextEditingController(text: 'MAS');
  final TextEditingController _toStationController =
      TextEditingController(text: 'SBC');

  List<TrainSearchItem> _searchResults = [];
  bool _isSearching = false;
  bool _hasSearched = false;

  @override
  void initState() {
    super.initState();
    StorageService.init().then((_) {
      if (mounted) setState(() {});
    });
  }

  void _onSearchTrain(String query) async {
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _hasSearched = false;
      });
      return;
    }

    setState(() {
      _isSearching = true;
      _hasSearched = true;
    });

    final results = await ApiService.searchTrains(query: query);
    if (mounted) {
      setState(() {
        _searchResults = results;
        _isSearching = false;
      });
    }
  }

  void _onFindTrainsByRoute() async {
    final from = _fromStationController.text.trim();
    final to = _toStationController.text.trim();

    setState(() {
      _isSearching = true;
      _hasSearched = true;
    });

    final results =
        await ApiService.searchTrains(fromStation: from, toStation: to);
    if (mounted) {
      setState(() {
        _searchResults = results;
        _isSearching = false;
      });
    }
  }

  void _swapStations() {
    setState(() {
      final temp = _fromStationController.text;
      _fromStationController.text = _toStationController.text;
      _toStationController.text = temp;
    });
  }

  void _openTrain(String trainNumber, String trainName, String route) {
    StorageService.addRecentSearch(trainNumber, trainName, route);
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => TrainDetailsScreen(trainNumber: trainNumber),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final recentSearches = StorageService.getRecentSearches();

    return Scaffold(
      backgroundColor: const Color(0xFF070B14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B1120),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0284C7), Color(0xFF0EA5E9)],
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.auto_awesome, size: 16, color: Colors.white),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'RailPredict',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'Dynamic Train ETA Forecasting',
                  style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.departure_board, color: Color(0xFF38BDF8)),
            tooltip: 'Station Board',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const StationBoardScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: Color(0xFF94A3B8)),
            tooltip: 'Settings',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Search Box Container
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0B1323),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1E293B)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Search by Train Input
                  const Text(
                    'SEARCH BY TRAIN',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: Color(0xFF38BDF8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _trainSearchController,
                    onChanged: _onSearchTrain,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Train number or name (e.g. 12627)',
                      hintStyle:
                          const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                      prefixIcon: const Icon(Icons.search,
                          color: Color(0xFF38BDF8), size: 20),
                      suffixIcon: _trainSearchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear,
                                  color: Color(0xFF64748B), size: 18),
                              onPressed: () {
                                _trainSearchController.clear();
                                _onSearchTrain('');
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: const Color(0xFF070C18),
                      contentPadding:
                          const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFF1E293B)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFF1E293B)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFF0EA5E9)),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),
                  const Divider(color: Color(0xFF1E293B), height: 1),
                  const SizedBox(height: 14),

                  // Search by Route Pair
                  const Text(
                    'SEARCH BY ROUTE',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: Color(0xFF38BDF8),
                    ),
                  ),
                  const SizedBox(height: 10),

                  Row(
                    children: [
                      // From Station
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF070C18),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFF1E293B)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('FROM',
                                  style: TextStyle(
                                      fontSize: 9, color: Color(0xFF64748B))),
                              TextField(
                                controller: _fromStationController,
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13),
                                decoration: const InputDecoration(
                                  isDense: true,
                                  contentPadding: EdgeInsets.zero,
                                  border: InputBorder.none,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Swap Button
                      IconButton(
                        onPressed: _swapStations,
                        icon: const Icon(Icons.swap_horiz,
                            color: Color(0xFF38BDF8)),
                      ),

                      // To Station
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF070C18),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFF1E293B)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('TO',
                                  style: TextStyle(
                                      fontSize: 9, color: Color(0xFF64748B))),
                              TextField(
                                controller: _toStationController,
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13),
                                decoration: const InputDecoration(
                                  isDense: true,
                                  contentPadding: EdgeInsets.zero,
                                  border: InputBorder.none,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Find Trains Button
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: _onFindTrainsByRoute,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0284C7),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.directions_railway,
                              size: 18, color: Colors.white),
                          SizedBox(width: 8),
                          Text(
                            'Find Trains',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // 2. Search Results List (if search active)
            if (_hasSearched) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Matching Trains',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    if (_isSearching)
                      const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Color(0xFF38BDF8)),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 8),

              if (_searchResults.isEmpty && !_isSearching)
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0B1323),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: Text(
                      'No trains found. Try searching 12627 or MAS to SBC.',
                      style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _searchResults.length,
                  itemBuilder: (context, index) {
                    final item = _searchResults[index];
                    return _buildTrainSearchCard(item);
                  },
                ),
            ],

            // 3. Recent Searches Section
            if (recentSearches.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  'Recent Searches',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 70,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: recentSearches.length,
                  itemBuilder: (context, index) {
                    final s = recentSearches[index];
                    return InkWell(
                      onTap: () => _openTrain(
                        s['train_number'] ?? '12627',
                        s['train_name'] ?? 'Karnataka Express',
                        s['route'] ?? 'MAS → SBC',
                      ),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        margin: const EdgeInsets.only(right: 10),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0B1323),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFF1E293B)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              '${s['train_number']} ${s['train_name']}',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              s['route'] ?? '',
                              style: const TextStyle(
                                fontSize: 10,
                                color: Color(0xFF38BDF8),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildTrainSearchCard(TrainSearchItem item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1323),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        onTap: () => _openTrain(
          item.trainNumber,
          item.trainName,
          '${item.sourceStationCode} → ${item.destStationCode}',
        ),
        title: Row(
          children: [
            Text(
              item.trainNumber,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                fontFamily: 'monospace',
                color: Color(0xFF38BDF8),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                item.trainName,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Row(
            children: [
              Text(
                '${item.sourceStationCode} (${item.departureTime}) → ${item.destStationCode} (${item.arrivalTime})',
                style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
              ),
            ],
          ),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: item.currentDelayMinutes > 0
                ? const Color(0xFF78350F).withValues(alpha: 0.4)
                : const Color(0xFF064E3B).withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            item.currentDelayMinutes > 0
                ? '+${item.currentDelayMinutes}m'
                : 'ON TIME',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: item.currentDelayMinutes > 0
                  ? const Color(0xFFFBBF24)
                  : const Color(0xFF34D399),
            ),
          ),
        ),
      ),
    );
  }
}
