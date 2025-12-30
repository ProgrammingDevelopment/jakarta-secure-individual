
import sys
import json
import os

# Add project root to sys.path to allow imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

# Import Tools
try:
    from tools.data.nik_processor import NIKProcessor
    from tools.data.phone_processor import PhoneProcessor
    from tools.fraud.fraud_detector import FraudDetector
    from tools.personas.persona_analyzer import PersonaAnalyzer
    from tools.tracking.device_tracker import DeviceTracker
except Exception as e:
    print(json.dumps({"error": f"Import Error: {str(e)}"}))
    sys.exit(1)

def main():
    try:
        # Read args from stdin or command line argument
        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
        else:
            print(json.dumps({"error": "No input provided"}))
            return

        command = input_data.get('command')
        payload = input_data.get('payload', {})
        
        result = {}

        if command == 'analyze_nik':
            processor = NIKProcessor()
            result = processor.parse_nik(payload.get('nik'))
            
        elif command == 'check_slik':
            processor = NIKProcessor()
            result = processor.check_slik_ojk(payload.get('nik'))

        elif command == 'analyze_phone':
            processor = PhoneProcessor()
            result = processor.analyze_phone(payload.get('phone'))

        elif command == 'fraud_check_imei':
            detector = FraudDetector()
            result = detector.check_imei_indonesia(payload.get('imei'))
            
        elif command == 'fraud_check_phone':
            detector = FraudDetector()
            result = detector.analyze_phone_fraud_deep(payload.get('phone'))

        elif command == 'analyze_persona':
            analyzer = PersonaAnalyzer()
            result = analyzer.full_analysis_persona(
                payload.get('name'), 
                payload.get('phone'), 
                payload.get('nik')
            )
            
        elif command == 'track_device':
            tracker = DeviceTracker()
            result = tracker.track_device(payload.get('phone'))

        else:
            result = {"error": f"Unknown command: {command}"}

        # Print JSON result to stdout
        print(json.dumps(result, default=str))

    except Exception as e:
        print(json.dumps({"error": f"Execution Error: {str(e)}"}))

if __name__ == "__main__":
    main()
