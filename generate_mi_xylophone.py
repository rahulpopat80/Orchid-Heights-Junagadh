import wave, struct, math

sample_rate = 44100
duration = 3.0

# 3 notes: C6, E6, G6
notes = [1046.50, 1318.51, 1567.98]
note_duration = 0.15 # seconds per note

obj = wave.open('public/notification.wav', 'w')
obj.setnchannels(1)
obj.setsampwidth(2)
obj.setframerate(sample_rate)

for i in range(int(sample_rate * duration)):
    time = i / sample_rate
    value = 0
    
    for idx, freq in enumerate(notes):
        start_time = idx * note_duration
        if time >= start_time:
            local_time = time - start_time
            # Xylophone fast decay envelope
            envelope = math.exp(-15 * local_time) if local_time < 1.0 else 0
            value += int(envelope * 10000.0 * math.sin(2.0 * math.pi * freq * local_time))
            
    # clamp value
    value = max(-32767, min(32767, value))
    data = struct.pack('<h', value)
    obj.writeframesraw(data)
obj.close()
