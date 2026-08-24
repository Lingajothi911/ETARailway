import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070B14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B1120),
        elevation: 0,
        title: const Text(
          'Settings & Architecture',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Project Summary Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F2038), Color(0xFF0A1526)],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: const Color(0xFF0EA5E9).withValues(alpha: 0.4),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.auto_awesome, color: Color(0xFF38BDF8), size: 18),
                    SizedBox(width: 8),
                    Text(
                      'RailPredict Prototype',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                const Text(
                  'Dynamic Train ETA Forecasting for Indian Railways Coaching Trains',
                  style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF070C18),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'Innovation: Replaces simple "Scheduled + Delay" calculation with multi-feature dynamic prediction (historical section recovery, downstream congestion, rake priority, dwell variance).',
                    style: TextStyle(fontSize: 11, color: Color(0xFFE2E8F0)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          const Text(
            'DEMO CONTROLS',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.1,
              color: Color(0xFF38BDF8),
            ),
          ),
          const SizedBox(height: 8),

          _buildTile(
            icon: Icons.speed,
            title: 'Simulation Speed',
            subtitle: '5x Accelerated demo mode active',
          ),
          _buildTile(
            icon: Icons.notifications_active_outlined,
            title: 'Dynamic ETA Notifications',
            subtitle: 'In-app simulated arrival alerts enabled',
          ),
          _buildTile(
            icon: Icons.code,
            title: 'Prediction Engine Mode',
            subtitle: 'MockETAPredictor (Transparent Simulation Mode)',
          ),
          _buildTile(
            icon: Icons.info_outline,
            title: 'Version',
            subtitle: 'RailPredict v1.0.0-hackathon-build',
          ),
        ],
      ),
    );
  }

  Widget _buildTile({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0B1323),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF38BDF8), size: 22),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
        ),
      ),
    );
  }
}
