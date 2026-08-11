import wave, struct, math

sample_rate = 44100
duration = 3.0
frequency = 800.0

obj = wave.open('public/notification.wav', 'w')
obj.setnchannels(1)
obj.setsampwidth(2)
obj.setframerate(sample_rate)

for i in range(int(sample_rate * duration)):
    # Simple decaying envelope
    envelope = math.exp(-3 * i / sample_rate)
    value = int(envelope * 32767.0 * math.sin(2.0 * math.pi * frequency * i / sample_rate))
    data = struct.pack('<h', value)
    obj.writeframesraw(data)
obj.close()
