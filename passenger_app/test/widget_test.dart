import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/main.dart';

void main() {
  testWidgets('RailPredict App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const RailPredictApp());
    expect(find.text('RailPredict'), findsOneWidget);
    expect(find.text('Dynamic AI-Powered Train ETA Forecasting'), findsOneWidget);
    
    // Advance timer past splash screen transition
    await tester.pumpAndSettle(const Duration(seconds: 3));
    expect(find.text('SEARCH BY TRAIN'), findsOneWidget);
  });
}
