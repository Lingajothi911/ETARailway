import 'package:flutter/material.dart';
import '../models/train_models.dart';

class JourneyTimeline extends StatelessWidget {
  final List<StationSchedule> schedules;
  final String currentStationCode;

  const JourneyTimeline({
    super.key,
    required this.schedules,
    required this.currentStationCode,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: schedules.length,
      itemBuilder: (context, index) {
        final s = schedules[index];
        final isFirst = index == 0;
        final isLast = index == schedules.length - 1;
        final isCurrent = s.isCurrent || s.stationCode == currentStationCode;
        final isPassed = s.status == 'Passed';

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Scheduled / Predicted Times
              SizedBox(
                width: 70,
                child: Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        s.actualOrPredictedArrival ?? s.scheduledArrival,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          fontFamily: 'monospace',
                          color: isPassed
                              ? const Color(0xFF64748B)
                              : isCurrent
                                  ? const Color(0xFF38BDF8)
                                  : Colors.white,
                        ),
                      ),
                      if (s.delayMinutes > 0 && !isPassed)
                        Text(
                          '+${s.delayMinutes}m',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            color: s.delayMinutes >= 15
                                ? const Color(0xFFF87171)
                                : const Color(0xFFFBBF24),
                          ),
                        ),
                      if (isPassed)
                        const Text(
                          'Passed',
                          style: TextStyle(
                            fontSize: 10,
                            color: Color(0xFF475569),
                          ),
                        ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 12),

              // 2. Vertical Line & Indicator Node
              Column(
                children: [
                  // Top Line
                  Container(
                    width: 3,
                    height: 12,
                    color: isFirst
                        ? Colors.transparent
                        : isPassed
                            ? const Color(0xFF0EA5E9)
                            : const Color(0xFF1E293B),
                  ),

                  // Node Circle
                  Container(
                    width: isCurrent ? 20 : 14,
                    height: isCurrent ? 20 : 14,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isCurrent
                          ? const Color(0xFF38BDF8)
                          : isPassed
                              ? const Color(0xFF0284C7)
                              : const Color(0xFF1E293B),
                      border: Border.all(
                        color: isCurrent
                            ? Colors.white
                            : isPassed
                                ? const Color(0xFF38BDF8)
                                : const Color(0xFF475569),
                        width: isCurrent ? 3 : 2,
                      ),
                      boxShadow: isCurrent
                          ? [
                              BoxShadow(
                                color: const Color(0xFF38BDF8).withValues(alpha: 0.5),
                                blurRadius: 8,
                                spreadRadius: 2,
                              )
                            ]
                          : null,
                    ),
                    child: isPassed
                        ? const Icon(
                            Icons.check,
                            size: 8,
                            color: Colors.white,
                          )
                        : null,
                  ),

                  // Bottom Line
                  Expanded(
                    child: Container(
                      width: 3,
                      color: isLast
                          ? Colors.transparent
                          : (isPassed && !isCurrent)
                              ? const Color(0xFF0EA5E9)
                              : const Color(0xFF1E293B),
                    ),
                  ),
                ],
              ),

              const SizedBox(width: 12),

              // 3. Station Name, Platform, Distance
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 2, bottom: 18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              s.stationName,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: isCurrent
                                    ? FontWeight.w800
                                    : FontWeight.w600,
                                color: isPassed
                                    ? const Color(0xFF94A3B8)
                                    : isCurrent
                                        ? const Color(0xFF38BDF8)
                                        : Colors.white,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: const Color(0xFF334155),
                              ),
                            ),
                            child: Text(
                              'P${s.scheduledPlatform}',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: isCurrent
                                    ? const Color(0xFF38BDF8)
                                    : const Color(0xFF94A3B8),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Text(
                            '${s.distanceFromOriginKm.toInt()} km',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF64748B),
                            ),
                          ),
                          if (isCurrent) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 1,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0369A1).withValues(alpha: 0.4),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text(
                                'CURRENT / NEAREST',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF38BDF8),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
