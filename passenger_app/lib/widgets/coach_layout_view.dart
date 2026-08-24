import 'package:flutter/material.dart';
import '../models/train_models.dart';

class CoachLayoutView extends StatelessWidget {
  final List<CoachInfo> coaches;

  const CoachLayoutView({super.key, required this.coaches});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                  Icon(Icons.train, size: 18, color: Color(0xFF38BDF8)),
                  SizedBox(width: 8),
                  Text(
                    'Coach Composition & Position',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Text(
                '${coaches.length} Coaches',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Horizontal scrollable coach rake
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: coaches.map((coach) {
                final isEngine = coach.coachCode == 'ENG';
                final isAC = coach.coachCode.startsWith('A') ||
                    coach.coachCode.startsWith('B') ||
                    coach.coachCode.startsWith('H') ||
                    coach.coachCode.startsWith('C') ||
                    coach.coachCode.startsWith('E');
                final isSleeper = coach.coachCode.startsWith('S');

                return Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: isEngine
                        ? const Color(0xFF1E293B)
                        : isAC
                            ? const Color(0xFF0369A1).withValues(alpha: 0.3)
                            : isSleeper
                                ? const Color(0xFF065F46).withValues(alpha: 0.3)
                                : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isEngine
                          ? const Color(0xFF475569)
                          : isAC
                              ? const Color(0xFF38BDF8).withValues(alpha: 0.5)
                              : isSleeper
                                  ? const Color(0xFF34D399).withValues(alpha: 0.5)
                                  : const Color(0xFF334155),
                    ),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        isEngine ? Icons.arrow_back : Icons.chair_outlined,
                        size: 14,
                        color: isAC
                            ? const Color(0xFF38BDF8)
                            : isSleeper
                                ? const Color(0xFF34D399)
                                : const Color(0xFF94A3B8),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        coach.coachCode,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        coach.coachType,
                        style: const TextStyle(
                          fontSize: 8,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 10),
          const Text(
            '← Engine position facing towards destination',
            style: TextStyle(fontSize: 10, color: Color(0xFF64748B)),
          ),
        ],
      ),
    );
  }
}
