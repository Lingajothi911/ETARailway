import 'package:flutter/material.dart';

class StationBoardScreen extends StatefulWidget {
  const StationBoardScreen({super.key});

  @override
  State<StationBoardScreen> createState() => _StationBoardScreenState();
}

class _StationBoardScreenState extends State<StationBoardScreen> {
  String _selectedStation = 'KPD';

  final Map<String, String> _stations = {
    'MAS': 'Chennai Central (MAS)',
    'AJJ': 'Arakkonam (AJJ)',
    'KPD': 'Katpadi Junction (KPD)',
    'JTJ': 'Jolarpettai (JTJ)',
    'SBC': 'KSR Bengaluru (SBC)',
  };

  final List<Map<String, dynamic>> _demoBoard = [
    {
      'train_number': '12627',
      'train_name': 'Karnataka Express',
      'scheduled': '22:48',
      'traditional': '23:06',
      'ai_predicted': '23:01',
      'platform': 'P2',
      'status': 'Late 18m',
      'recovery': '5m recovered',
    },
    {
      'train_number': '16021',
      'train_name': 'Kaveri Express',
      'scheduled': '23:08',
      'traditional': '23:22',
      'ai_predicted': '23:19',
      'platform': 'P4 (Reassigned)',
      'status': 'Late 14m',
      'recovery': '3m recovered',
    },
    {
      'train_number': '20607',
      'train_name': 'Vande Bharat Express',
      'scheduled': '07:13',
      'traditional': '07:15',
      'ai_predicted': '07:15',
      'platform': 'P1',
      'status': 'On Time',
      'recovery': 'Green wave',
    },
    {
      'train_number': '12007',
      'train_name': 'Shatabdi Express',
      'scheduled': '07:38',
      'traditional': '07:43',
      'ai_predicted': '07:41',
      'platform': 'P1',
      'status': 'Late 5m',
      'recovery': '2m recovered',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070B14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B1120),
        elevation: 0,
        title: const Text(
          'Live Station Departure Board',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
      body: Column(
        children: [
          // Station Selector Dropdown
          Container(
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF0B1323),
            child: Row(
              children: [
                const Icon(Icons.location_on, color: Color(0xFF38BDF8), size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: _selectedStation,
                    dropdownColor: const Color(0xFF0F172A),
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      isDense: true,
                      contentPadding:
                          const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      filled: true,
                      fillColor: const Color(0xFF070C18),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: Color(0xFF1E293B)),
                      ),
                    ),
                    items: _stations.entries.map((e) {
                      return DropdownMenuItem(
                        value: e.key,
                        child: Text(e.value),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedStation = val);
                      }
                    },
                  ),
                ),
              ],
            ),
          ),

          // Station Departures List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _demoBoard.length,
              itemBuilder: (context, index) {
                final item = _demoBoard[index];

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0B1323),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text(
                                item['train_number'],
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                  color: Color(0xFF38BDF8),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                item['train_name'],
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              item['platform'],
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFE2E8F0),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Time Matrix
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'SCHEDULED',
                                  style: TextStyle(
                                      fontSize: 9, color: Color(0xFF64748B)),
                                ),
                                Text(
                                  item['scheduled'],
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    fontFamily: 'monospace',
                                    color: Color(0xFF94A3B8),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'TRADITIONAL',
                                  style: TextStyle(
                                      fontSize: 9, color: Color(0xFFF59E0B)),
                                ),
                                Text(
                                  item['traditional'],
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    fontFamily: 'monospace',
                                    color: Color(0xFFFBBF24),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'AI PREDICTED',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF38BDF8),
                                  ),
                                ),
                                Text(
                                  item['ai_predicted'],
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'monospace',
                                    color: Color(0xFF38BDF8),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
