import 'package:flutter/material.dart';
import '../models/train_models.dart';

class RouteMapView extends StatelessWidget {
  final TrainDetail trainDetail;

  const RouteMapView({super.key, required this.trainDetail});

  @override
  Widget build(BuildContext context) {
    final live = trainDetail.liveState;
    final schedules = trainDetail.schedules;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1323),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.map_outlined, size: 18, color: Color(0xFF38BDF8)),
                  SizedBox(width: 8),
                  Text(
                    'Corridor Route Map',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF0369A1).withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '${live.currentSpeedKmph.toInt()} km/h',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                    color: Color(0xFF38BDF8),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Custom Route Canvas
          Container(
            height: 220,
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFF070C18),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: CustomPaint(
              painter: RouteMapPainter(
                schedules: schedules,
                progressPercentage: live.progressPercentage,
                currentStationCode: live.currentStationCode,
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Telemetry details footer
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'CURRENT COORDINATES',
                    style: TextStyle(fontSize: 9, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${live.currentLat.toStringAsFixed(4)}° N, ${live.currentLng.toStringAsFixed(4)}° E',
                    style: const TextStyle(
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'DISTANCE COVERED',
                    style: TextStyle(fontSize: 9, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${live.distanceCoveredKm.toInt()} / ${live.totalDistanceKm.toInt()} km (${live.progressPercentage.toInt()}%)',
                    style: const TextStyle(
                      fontSize: 11,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF38BDF8),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class RouteMapPainter extends CustomPainter {
  final List<StationSchedule> schedules;
  final double progressPercentage;
  final String currentStationCode;

  RouteMapPainter({
    required this.schedules,
    required this.progressPercentage,
    required this.currentStationCode,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (schedules.isEmpty) return;

    final backgroundPaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..strokeWidth = 6.0
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final completedPaint = Paint()
      ..color = const Color(0xFF0EA5E9)
      ..strokeWidth = 6.0
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final path = Path();
    final List<Offset> points = [];

    // Calculate station points along a smooth curve
    for (int i = 0; i < schedules.length; i++) {
      final double x = 30 + (size.width - 60) * (i / (schedules.length - 1));
      // Alternate subtle curve
      final double y = size.height * 0.5 + (i % 2 == 0 ? -25 : 25);
      points.add(Offset(x, y));

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    // Draw track
    canvas.drawPath(path, backgroundPaint);

    // Draw completed progress
    final double trainProgress = progressPercentage / 100.0;
    final int targetSegment =
        ((points.length - 1) * trainProgress).floor().clamp(0, points.length - 2);
    final double subProgress =
        ((trainProgress * (points.length - 1)) - targetSegment).clamp(0.0, 1.0);

    final completedPath = Path();
    completedPath.moveTo(points[0].dx, points[0].dy);
    for (int i = 1; i <= targetSegment; i++) {
      completedPath.lineTo(points[i].dx, points[i].dy);
    }

    final p1 = points[targetSegment];
    final p2 = points[targetSegment + 1];
    final trainX = p1.dx + (p2.dx - p1.dx) * subProgress;
    final trainY = p1.dy + (p2.dy - p1.dy) * subProgress;
    completedPath.lineTo(trainX, trainY);

    canvas.drawPath(completedPath, completedPaint);

    // Draw Station Markers
    for (int i = 0; i < points.length; i++) {
      final p = points[i];
      final stn = schedules[i];
      final isCurrent = stn.stationCode == currentStationCode;

      // Station Circle
      final nodePaint = Paint()
        ..color = isCurrent ? const Color(0xFF38BDF8) : const Color(0xFF0F172A)
        ..style = PaintingStyle.fill;

      final borderPaint = Paint()
        ..color = isCurrent ? Colors.white : const Color(0xFF0EA5E9)
        ..strokeWidth = 2.0
        ..style = PaintingStyle.stroke;

      canvas.drawCircle(p, isCurrent ? 7 : 5, nodePaint);
      canvas.drawCircle(p, isCurrent ? 7 : 5, borderPaint);

      // Station Text
      final textPainter = TextPainter(
        text: TextSpan(
          text: stn.stationCode,
          style: const TextStyle(
            color: Color(0xFF94A3B8),
            fontSize: 9,
            fontWeight: FontWeight.bold,
            fontFamily: 'monospace',
          ),
        ),
        textDirection: TextDirection.ltr,
      );
      textPainter.layout();
      textPainter.paint(
        canvas,
        Offset(p.dx - textPainter.width / 2, p.dy + (i % 2 == 0 ? -22 : 12)),
      );
    }

    // Draw Live Train Marker
    final trainGlowPaint = Paint()
      ..color = const Color(0xFF38BDF8).withValues(alpha: 0.4)
      ..style = PaintingStyle.fill;

    final trainMarkerPaint = Paint()
      ..color = const Color(0xFF0284C7)
      ..style = PaintingStyle.fill;

    final trainStrokePaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;

    canvas.drawCircle(Offset(trainX, trainY), 14, trainGlowPaint);
    canvas.drawCircle(Offset(trainX, trainY), 8, trainMarkerPaint);
    canvas.drawCircle(Offset(trainX, trainY), 8, trainStrokePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
