class PredictionFactor {
  final String factorName;
  final int impactMinutes;
  final String description;

  PredictionFactor({
    required this.factorName,
    required this.impactMinutes,
    required this.description,
  });

  factory PredictionFactor.fromJson(Map<String, dynamic> json) {
    return PredictionFactor(
      factorName: json['factor_name'] ?? '',
      impactMinutes: json['impact_minutes'] ?? 0,
      description: json['description'] ?? '',
    );
  }
}

class PredictionOutput {
  final String stationCode;
  final String stationName;
  final String scheduledArrival;
  final String scheduledDeparture;
  final String traditionalEta;
  final String predictedArrival;
  final String predictedDeparture;
  final int predictedDelayMinutes;
  final int delayVarianceFromTraditional;
  final double confidenceScore;
  final String confidenceDisclaimer;
  final String predictionSource;
  final String modelVersion;
  final List<PredictionFactor> factors;
  final String predictionTimestamp;

  PredictionOutput({
    required this.stationCode,
    required this.stationName,
    required this.scheduledArrival,
    required this.scheduledDeparture,
    required this.traditionalEta,
    required this.predictedArrival,
    required this.predictedDeparture,
    required this.predictedDelayMinutes,
    required this.delayVarianceFromTraditional,
    required this.confidenceScore,
    required this.confidenceDisclaimer,
    required this.predictionSource,
    required this.modelVersion,
    required this.factors,
    required this.predictionTimestamp,
  });

  factory PredictionOutput.fromJson(Map<String, dynamic> json) {
    var rawFactors = json['factors'] as List? ?? [];
    List<PredictionFactor> factorsList =
        rawFactors.map((f) => PredictionFactor.fromJson(f)).toList();

    return PredictionOutput(
      stationCode: json['station_code'] ?? '',
      stationName: json['station_name'] ?? '',
      scheduledArrival: json['scheduled_arrival'] ?? '',
      scheduledDeparture: json['scheduled_departure'] ?? '',
      traditionalEta: json['traditional_eta'] ?? '',
      predictedArrival: json['predicted_arrival'] ?? '',
      predictedDeparture: json['predicted_departure'] ?? '',
      predictedDelayMinutes: json['predicted_delay_minutes'] ?? 0,
      delayVarianceFromTraditional: json['delay_variance_from_traditional'] ?? 0,
      confidenceScore: (json['confidence_score'] as num?)?.toDouble() ?? 0.85,
      confidenceDisclaimer: json['confidence_disclaimer'] ?? '',
      predictionSource: json['prediction_source'] ?? 'simulation',
      modelVersion: json['model_version'] ?? 'mock-v1.2',
      factors: factorsList,
      predictionTimestamp: json['prediction_timestamp'] ?? '',
    );
  }
}

class StationSchedule {
  final int sequenceNumber;
  final String stationCode;
  final String stationName;
  final String scheduledArrival;
  final String scheduledDeparture;
  final double distanceFromOriginKm;
  final String scheduledPlatform;
  final String? actualOrPredictedArrival;
  final String? actualOrPredictedDeparture;
  final int delayMinutes;
  final String status; // "Passed", "Current", "Upcoming"
  final bool isCurrent;
  final PredictionOutput? aiPrediction;

  StationSchedule({
    required this.sequenceNumber,
    required this.stationCode,
    required this.stationName,
    required this.scheduledArrival,
    required this.scheduledDeparture,
    required this.distanceFromOriginKm,
    required this.scheduledPlatform,
    this.actualOrPredictedArrival,
    this.actualOrPredictedDeparture,
    required this.delayMinutes,
    required this.status,
    required this.isCurrent,
    this.aiPrediction,
  });

  factory StationSchedule.fromJson(Map<String, dynamic> json) {
    return StationSchedule(
      sequenceNumber: json['sequence_number'] ?? 0,
      stationCode: json['station_code'] ?? '',
      stationName: json['station_name'] ?? '',
      scheduledArrival: json['scheduled_arrival'] ?? '',
      scheduledDeparture: json['scheduled_departure'] ?? '',
      distanceFromOriginKm:
          (json['distance_from_origin_km'] as num?)?.toDouble() ?? 0.0,
      scheduledPlatform: json['scheduled_platform'] ?? '1',
      actualOrPredictedArrival: json['actual_or_predicted_arrival'],
      actualOrPredictedDeparture: json['actual_or_predicted_departure'],
      delayMinutes: json['delay_minutes'] ?? 0,
      status: json['status'] ?? 'Upcoming',
      isCurrent: json['is_current'] ?? false,
      aiPrediction: json['ai_prediction'] != null
          ? PredictionOutput.fromJson(json['ai_prediction'])
          : null,
    );
  }
}

class LiveState {
  final String currentStationCode;
  final String currentStationName;
  final String nextStationCode;
  final String nextStationName;
  final String currentStatus;
  final int currentDelayMinutes;
  final double distanceCoveredKm;
  final double totalDistanceKm;
  final double currentSpeedKmph;
  final double currentLat;
  final double currentLng;
  final double progressPercentage;
  final String lastUpdated;

  LiveState({
    required this.currentStationCode,
    required this.currentStationName,
    required this.nextStationCode,
    required this.nextStationName,
    required this.currentStatus,
    required this.currentDelayMinutes,
    required this.distanceCoveredKm,
    required this.totalDistanceKm,
    required this.currentSpeedKmph,
    required this.currentLat,
    required this.currentLng,
    required this.progressPercentage,
    required this.lastUpdated,
  });

  factory LiveState.fromJson(Map<String, dynamic> json) {
    return LiveState(
      currentStationCode: json['current_station_code'] ?? '',
      currentStationName: json['current_station_name'] ?? '',
      nextStationCode: json['next_station_code'] ?? '',
      nextStationName: json['next_station_name'] ?? '',
      currentStatus: json['current_status'] ?? 'Running',
      currentDelayMinutes: json['current_delay_minutes'] ?? 0,
      distanceCoveredKm:
          (json['distance_covered_km'] as num?)?.toDouble() ?? 0.0,
      totalDistanceKm: (json['total_distance_km'] as num?)?.toDouble() ?? 360.0,
      currentSpeedKmph: (json['current_speed_kmph'] as num?)?.toDouble() ?? 0.0,
      currentLat: (json['current_lat'] as num?)?.toDouble() ?? 13.0,
      currentLng: (json['current_lng'] as num?)?.toDouble() ?? 80.0,
      progressPercentage:
          (json['progress_percentage'] as num?)?.toDouble() ?? 0.0,
      lastUpdated: json['last_updated'] ?? 'Just now',
    );
  }
}

class CoachInfo {
  final int sequenceNumber;
  final String coachCode;
  final String coachType;
  final String? description;

  CoachInfo({
    required this.sequenceNumber,
    required this.coachCode,
    required this.coachType,
    this.description,
  });

  factory CoachInfo.fromJson(Map<String, dynamic> json) {
    return CoachInfo(
      sequenceNumber: json['sequence_number'] ?? 0,
      coachCode: json['coach_code'] ?? '',
      coachType: json['coach_type'] ?? '',
      description: json['description'],
    );
  }
}

class TrainSearchItem {
  final int id;
  final String trainNumber;
  final String trainName;
  final String trainType;
  final String sourceStationCode;
  final String sourceStationName;
  final String destStationCode;
  final String destStationName;
  final String departureTime;
  final String arrivalTime;
  final String currentStatus;
  final int currentDelayMinutes;
  final String currentStationName;

  TrainSearchItem({
    required this.id,
    required this.trainNumber,
    required this.trainName,
    required this.trainType,
    required this.sourceStationCode,
    required this.sourceStationName,
    required this.destStationCode,
    required this.destStationName,
    required this.departureTime,
    required this.arrivalTime,
    required this.currentStatus,
    required this.currentDelayMinutes,
    required this.currentStationName,
  });

  factory TrainSearchItem.fromJson(Map<String, dynamic> json) {
    return TrainSearchItem(
      id: json['id'] ?? 0,
      trainNumber: json['train_number'] ?? '',
      trainName: json['train_name'] ?? '',
      trainType: json['train_type'] ?? 'Superfast Express',
      sourceStationCode: json['source_station_code'] ?? '',
      sourceStationName: json['source_station_name'] ?? '',
      destStationCode: json['dest_station_code'] ?? '',
      destStationName: json['dest_station_name'] ?? '',
      departureTime: json['departure_time'] ?? '',
      arrivalTime: json['arrival_time'] ?? '',
      currentStatus: json['current_status'] ?? 'Running',
      currentDelayMinutes: json['current_delay_minutes'] ?? 0,
      currentStationName: json['current_station_name'] ?? '',
    );
  }
}

class TrainDetail {
  final int id;
  final String trainNumber;
  final String trainName;
  final String trainType;
  final String sourceStationCode;
  final String sourceStationName;
  final String destStationCode;
  final String destStationName;
  final double totalDistanceKm;
  final String priorityLevel;
  final LiveState liveState;
  final List<StationSchedule> schedules;
  final List<CoachInfo> coaches;
  final PredictionOutput? nextStationPrediction;

  TrainDetail({
    required this.id,
    required this.trainNumber,
    required this.trainName,
    required this.trainType,
    required this.sourceStationCode,
    required this.sourceStationName,
    required this.destStationCode,
    required this.destStationName,
    required this.totalDistanceKm,
    required this.priorityLevel,
    required this.liveState,
    required this.schedules,
    required this.coaches,
    this.nextStationPrediction,
  });

  factory TrainDetail.fromJson(Map<String, dynamic> json) {
    var rawSchedules = json['schedules'] as List? ?? [];
    var rawCoaches = json['coaches'] as List? ?? [];

    return TrainDetail(
      id: json['id'] ?? 0,
      trainNumber: json['train_number'] ?? '',
      trainName: json['train_name'] ?? '',
      trainType: json['train_type'] ?? 'Superfast Express',
      sourceStationCode: json['source_station_code'] ?? '',
      sourceStationName: json['source_station_name'] ?? '',
      destStationCode: json['dest_station_code'] ?? '',
      destStationName: json['dest_station_name'] ?? '',
      totalDistanceKm: (json['total_distance_km'] as num?)?.toDouble() ?? 360.0,
      priorityLevel: json['priority_level'] ?? 'High',
      liveState: LiveState.fromJson(json['live_state'] ?? {}),
      schedules: rawSchedules.map((s) => StationSchedule.fromJson(s)).toList(),
      coaches: rawCoaches.map((c) => CoachInfo.fromJson(c)).toList(),
      nextStationPrediction: json['next_station_prediction'] != null
          ? PredictionOutput.fromJson(json['next_station_prediction'])
          : null,
    );
  }
}
