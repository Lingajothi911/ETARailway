import 'dart:async';
import 'package:flutter/material.dart';
import '../models/train_models.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../widgets/ai_eta_card.dart';
import '../widgets/journey_timeline.dart';
import '../widgets/route_map_view.dart';
import '../widgets/coach_layout_view.dart';

class TrainDetailsScreen extends StatefulWidget {
  final String trainNumber;

  const TrainDetailsScreen({super.key, required this.trainNumber});

  @override
  State<TrainDetailsScreen> createState() => _TrainDetailsScreenState();
}

class _TrainDetailsScreenState extends State<TrainDetailsScreen>
    with SingleTickerProviderStateMixin {
  TrainDetail? _trainDetail;
  bool _isLoading = true;
  bool _isFavorite = false;
  Timer? _refreshTimer;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _isFavorite = StorageService.isFavorite(widget.trainNumber);
    _loadTrainDetails();

    // Auto refresh every 4 seconds to reflect live simulator updates
    _refreshTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      _loadTrainDetails(silent: true);
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _tabController.dispose();
    super.dispose();
  }

  void _loadTrainDetails({bool silent = false}) async {
    if (!silent) {
      setState(() => _isLoading = true);
    }
    final detail = await ApiService.getTrainDetails(widget.trainNumber);
    if (mounted) {
      setState(() {
        _trainDetail = detail;
        _isLoading = false;
      });
    }
  }

  void _toggleFavorite() {
    StorageService.toggleFavorite(widget.trainNumber);
    setState(() {
      _isFavorite = !_isFavorite;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _isFavorite
              ? '${widget.trainNumber} added to Favorites'
              : '${widget.trainNumber} removed from Favorites',
        ),
        duration: const Duration(seconds: 2),
        backgroundColor: const Color(0xFF0F172A),
      ),
    );
  }

  void _showDelayInjectionModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.bolt, color: Colors.amber, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Inject Operational Delay (Live Demo)',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              const Text(
                'Simulate delay disruption to see dynamic AI ETA recalculate in real time.',
                style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [5, 10, 15, 20].map((mins) {
                  return ElevatedButton(
                    onPressed: () async {
                      Navigator.pop(ctx);
                      await ApiService.injectDelay(widget.trainNumber, mins);
                      _loadTrainDetails();
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              '+$mins min delay injected! AI ETA recalculating...',
                            ),
                            backgroundColor: const Color(0xFF0284C7),
                          ),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E293B),
                      side: const BorderSide(color: Color(0xFF38BDF8)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      '+$mins m',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF38BDF8),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 12),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && _trainDetail == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF070B14),
        body: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF38BDF8)),
          ),
        ),
      );
    }

    final detail = _trainDetail!;
    final live = detail.liveState;
    final pred = detail.nextStationPrediction;

    return Scaffold(
      backgroundColor: const Color(0xFF070B14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B1120),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  detail.trainNumber,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: Color(0xFF38BDF8),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    detail.trainName,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            Text(
              '${detail.sourceStationCode} → ${detail.destStationCode}',
              style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.bolt, color: Colors.amber),
            tooltip: 'Inject Delay Demo',
            onPressed: _showDelayInjectionModal,
          ),
          IconButton(
            icon: Icon(
              _isFavorite ? Icons.favorite : Icons.favorite_border,
              color: _isFavorite ? const Color(0xFFF43F5E) : Colors.white,
            ),
            tooltip: 'Favorite',
            onPressed: _toggleFavorite,
          ),
        ],
      ),
      body: Column(
        children: [
          // 1. Live Running Status Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: const Color(0xFF0B1323),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: live.currentDelayMinutes > 0
                            ? const Color(0xFFF59E0B)
                            : const Color(0xFF10B981),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      live.currentDelayMinutes > 0
                          ? 'DELAYED BY ${live.currentDelayMinutes} MIN'
                          : 'RUNNING ON TIME',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                        color: live.currentDelayMinutes > 0
                            ? const Color(0xFFFBBF24)
                            : const Color(0xFF34D399),
                      ),
                    ),
                  ],
                ),
                Text(
                  'Updated ${live.lastUpdated}',
                  style:
                      const TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                ),
              ],
            ),
          ),

          // 2. Main Content Tabs
          Container(
            color: const Color(0xFF0B1120),
            child: TabBar(
              controller: _tabController,
              indicatorColor: const Color(0xFF38BDF8),
              indicatorWeight: 3,
              labelColor: const Color(0xFF38BDF8),
              unselectedLabelColor: const Color(0xFF64748B),
              labelStyle:
                  const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              tabs: const [
                Tab(text: 'TIMELINE & ETA'),
                Tab(text: 'LIVE MAP'),
                Tab(text: 'COACHES'),
              ],
            ),
          ),

          // 3. Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Tab 1: AI ETA Hero Card + Station Timeline
                SingleChildScrollView(
                  child: Column(
                    children: [
                      if (pred != null)
                        AiEtaCard(
                          prediction: pred,
                          nextStationName: live.nextStationName,
                          platform: '2',
                          currentDelayMinutes: live.currentDelayMinutes,
                        ),
                      JourneyTimeline(
                        schedules: detail.schedules,
                        currentStationCode: live.currentStationCode,
                      ),
                    ],
                  ),
                ),

                // Tab 2: Route Map
                SingleChildScrollView(
                  child: RouteMapView(trainDetail: detail),
                ),

                // Tab 3: Coach Layout
                SingleChildScrollView(
                  child: CoachLayoutView(coaches: detail.coaches),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
