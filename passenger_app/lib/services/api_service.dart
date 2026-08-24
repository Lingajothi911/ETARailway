import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/train_models.dart';

class ApiService {
  // Configurable base URL: Android emulator uses 10.0.2.2, Web/Desktop uses localhost
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:8000/api';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:8000/api';
    } catch (_) {}
    return 'http://localhost:8000/api';
  }

  // 1. Search Trains
  static Future<List<TrainSearchItem>> searchTrains({
    String? query,
    String? fromStation,
    String? toStation,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/trains/search').replace(
        queryParameters: {
          if (query != null && query.isNotEmpty) 'q': query,
          if (fromStation != null && fromStation.isNotEmpty)
            'from_stn': fromStation,
          if (toStation != null && toStation.isNotEmpty) 'to_stn': toStation,
        },
      );

      final response = await http.get(uri).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((item) => TrainSearchItem.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('ApiService.searchTrains fallback: $e');
    }

    // Demo Fallback Data for offline evaluation
    return _getFallbackSearchData(query, fromStation, toStation);
  }

  // 2. Get Train Details
  static Future<TrainDetail> getTrainDetails(String trainIdOrNumber) async {
    try {
      final uri = Uri.parse('$baseUrl/trains/$trainIdOrNumber');
      final response = await http.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return TrainDetail.fromJson(data);
      }
    } catch (e) {
      debugPrint('ApiService.getTrainDetails fallback: $e');
    }

    return _getFallbackTrainDetails(trainIdOrNumber);
  }

  // 3. Trigger manual delay injection for live in-app testing
  static Future<bool> injectDelay(
      String trainNumber, int addedDelayMinutes) async {
    try {
      final uri = Uri.parse('$baseUrl/simulation/inject_delay');
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'action': 'inject_delay',
          'train_number': trainNumber,
          'added_delay_minutes': addedDelayMinutes,
        }),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // Fallback Mock Datasets
  static List<TrainSearchItem> _getFallbackSearchData(
      String? q, String? from, String? to) {
    final allTrains = [
      TrainSearchItem(
        id: 1,
        trainNumber: '12627',
        trainName: 'Karnataka Express',
        trainType: 'Superfast Express',
        sourceStationCode: 'MAS',
        sourceStationName: 'Chennai Central',
        destStationCode: 'SBC',
        destStationName: 'KSR Bengaluru',
        departureTime: '21:00',
        arrivalTime: '02:50',
        currentStatus: 'Running',
        currentDelayMinutes: 18,
        currentStationName: 'Arakkonam Junction',
      ),
      TrainSearchItem(
        id: 2,
        trainNumber: '20607',
        trainName: 'Vande Bharat Express',
        trainType: 'Vande Bharat Express',
        sourceStationCode: 'MAS',
        sourceStationName: 'Chennai Central',
        destStationCode: 'SBC',
        destStationName: 'KSR Bengaluru',
        departureTime: '05:50',
        arrivalTime: '10:15',
        currentStatus: 'Running',
        currentDelayMinutes: 2,
        currentStationName: 'Katpadi Junction',
      ),
      TrainSearchItem(
        id: 3,
        trainNumber: '12007',
        trainName: 'Chennai - Mysuru Shatabdi Express',
        trainType: 'Shatabdi Express',
        sourceStationCode: 'MAS',
        sourceStationName: 'Chennai Central',
        destStationCode: 'SBC',
        destStationName: 'KSR Bengaluru',
        departureTime: '06:00',
        arrivalTime: '10:50',
        currentStatus: 'Running',
        currentDelayMinutes: 5,
        currentStationName: 'Chennai Central',
      ),
      TrainSearchItem(
        id: 4,
        trainNumber: '16021',
        trainName: 'Kaveri Express',
        trainType: 'Express',
        sourceStationCode: 'MAS',
        sourceStationName: 'Chennai Central',
        destStationCode: 'SBC',
        destStationName: 'KSR Bengaluru',
        departureTime: '21:15',
        arrivalTime: '03:30',
        currentStatus: 'Delayed',
        currentDelayMinutes: 14,
        currentStationName: 'Arakkonam Junction',
      ),
      TrainSearchItem(
        id: 5,
        trainNumber: '12675',
        trainName: 'Kovai Superfast Express',
        trainType: 'Superfast Express',
        sourceStationCode: 'MAS',
        sourceStationName: 'Chennai Central',
        destStationCode: 'CBE',
        destStationName: 'Coimbatore Junction',
        departureTime: '06:10',
        arrivalTime: '13:30',
        currentStatus: 'Running',
        currentDelayMinutes: 8,
        currentStationName: 'Jolarpettai Junction',
      ),
    ];

    if (q != null && q.isNotEmpty) {
      return allTrains
          .where((t) =>
              t.trainNumber.contains(q) ||
              t.trainName.toLowerCase().contains(q.toLowerCase()))
          .toList();
    }
    return allTrains;
  }

  static TrainDetail _getFallbackTrainDetails(String number) {
    return TrainDetail(
      id: 1,
      trainNumber: number.isNotEmpty ? number : '12627',
      trainName: 'Karnataka Express',
      trainType: 'Superfast Express',
      sourceStationCode: 'MAS',
      sourceStationName: 'Puratchi Thalaivar Dr. M.G.R. Chennai Central',
      destStationCode: 'SBC',
      destStationName: 'KSR Bengaluru City Junction',
      totalDistanceKm: 356.0,
      priorityLevel: 'High',
      liveState: LiveState(
        currentStationCode: 'AJJ',
        currentStationName: 'Arakkonam Junction',
        nextStationCode: 'KPD',
        nextStationName: 'Katpadi Junction',
        currentStatus: 'Delayed',
        currentDelayMinutes: 18,
        distanceCoveredKm: 95.0,
        totalDistanceKm: 356.0,
        currentSpeedKmph: 82.0,
        currentLat: 13.04,
        currentLng: 79.41,
        progressPercentage: 26.7,
        lastUpdated: '18s ago',
      ),
      nextStationPrediction: PredictionOutput(
        stationCode: 'KPD',
        stationName: 'Katpadi Junction',
        scheduledArrival: '22:48',
        scheduledDeparture: '22:50',
        traditionalEta: '23:06',
        predictedArrival: '23:01',
        predictedDeparture: '23:03',
        predictedDelayMinutes: 13,
        delayVarianceFromTraditional: -5,
        confidenceScore: 0.88,
        confidenceDisclaimer:
            'Simulated prototype score. Calibrated based on historical section variance.',
        predictionSource: 'simulation',
        modelVersion: 'mock-v1.2',
        factors: [
          PredictionFactor(
            factorName: 'Historical Section Running Pattern',
            impactMinutes: -5,
            description:
                'Section schedule includes 6 min speed buffer allowing 5 min recovery on double electrified track.',
          ),
          PredictionFactor(
            factorName: 'Downstream Junction Yard Load',
            impactMinutes: 2,
            description: 'Moderate platform switch queue near Katpadi.',
          ),
          PredictionFactor(
            factorName: 'Green Signal Clearance Factor',
            impactMinutes: -2,
            description: 'Automated interlocking priority for Superfast rake.',
          )
        ],
        predictionTimestamp: DateTime.now().toIso8601String(),
      ),
      schedules: [
        StationSchedule(
          sequenceNumber: 1,
          stationCode: 'MAS',
          stationName: 'Puratchi Thalaivar Dr. M.G.R. Chennai Central',
          scheduledArrival: 'Source',
          scheduledDeparture: '21:00',
          distanceFromOriginKm: 0.0,
          scheduledPlatform: '2',
          delayMinutes: 0,
          status: 'Passed',
          isCurrent: false,
        ),
        StationSchedule(
          sequenceNumber: 2,
          stationCode: 'AJJ',
          stationName: 'Arakkonam Junction',
          scheduledArrival: '21:58',
          scheduledDeparture: '22:00',
          distanceFromOriginKm: 68.0,
          scheduledPlatform: '1',
          delayMinutes: 18,
          status: 'Current',
          isCurrent: true,
        ),
        StationSchedule(
          sequenceNumber: 3,
          stationCode: 'KPD',
          stationName: 'Katpadi Junction',
          scheduledArrival: '22:48',
          scheduledDeparture: '22:50',
          distanceFromOriginKm: 129.0,
          scheduledPlatform: '2',
          actualOrPredictedArrival: '23:01',
          actualOrPredictedDeparture: '23:03',
          delayMinutes: 13,
          status: 'Upcoming',
          isCurrent: false,
        ),
        StationSchedule(
          sequenceNumber: 4,
          stationCode: 'JTJ',
          stationName: 'Jolarpettai Junction',
          scheduledArrival: '00:08',
          scheduledDeparture: '00:10',
          distanceFromOriginKm: 213.0,
          scheduledPlatform: '3',
          actualOrPredictedArrival: '00:19',
          actualOrPredictedDeparture: '00:21',
          delayMinutes: 11,
          status: 'Upcoming',
          isCurrent: false,
        ),
        StationSchedule(
          sequenceNumber: 5,
          stationCode: 'BWT',
          stationName: 'Bangarapet Junction',
          scheduledArrival: '01:18',
          scheduledDeparture: '01:20',
          distanceFromOriginKm: 288.0,
          scheduledPlatform: '2',
          actualOrPredictedArrival: '01:27',
          actualOrPredictedDeparture: '01:29',
          delayMinutes: 9,
          status: 'Upcoming',
          isCurrent: false,
        ),
        StationSchedule(
          sequenceNumber: 6,
          stationCode: 'KJM',
          stationName: 'Krishnarajapuram',
          scheduledArrival: '02:08',
          scheduledDeparture: '02:10',
          distanceFromOriginKm: 343.0,
          scheduledPlatform: '4',
          actualOrPredictedArrival: '02:15',
          actualOrPredictedDeparture: '02:17',
          delayMinutes: 7,
          status: 'Upcoming',
          isCurrent: false,
        ),
        StationSchedule(
          sequenceNumber: 7,
          stationCode: 'SBC',
          stationName: 'KSR Bengaluru City Junction',
          scheduledArrival: '02:50',
          scheduledDeparture: 'Dest',
          distanceFromOriginKm: 356.0,
          scheduledPlatform: '5',
          actualOrPredictedArrival: '02:56',
          actualOrPredictedDeparture: 'Dest',
          delayMinutes: 6,
          status: 'Upcoming',
          isCurrent: false,
        ),
      ],
      coaches: [
        CoachInfo(
            sequenceNumber: 1,
            coachCode: 'ENG',
            coachType: 'Locomotive',
            description: 'WAP-7 Electric'),
        CoachInfo(
            sequenceNumber: 2,
            coachCode: 'GEN',
            coachType: 'General',
            description: 'Unreserved'),
        CoachInfo(
            sequenceNumber: 3,
            coachCode: 'S1',
            coachType: 'Sleeper',
            description: 'Sleeper Class (SL)'),
        CoachInfo(
            sequenceNumber: 4,
            coachCode: 'S2',
            coachType: 'Sleeper',
            description: 'Sleeper Class (SL)'),
        CoachInfo(
            sequenceNumber: 5,
            coachCode: 'B1',
            coachType: '3AC',
            description: 'AC 3 Tier (3A)'),
        CoachInfo(
            sequenceNumber: 6,
            coachCode: 'B2',
            coachType: '3AC',
            description: 'AC 3 Tier (3A)'),
        CoachInfo(
            sequenceNumber: 7,
            coachCode: 'A1',
            coachType: '2AC',
            description: 'AC 2 Tier (2A)'),
        CoachInfo(
            sequenceNumber: 8,
            coachCode: 'GEN',
            coachType: 'General',
            description: 'General & Brake'),
      ],
    );
  }
}
