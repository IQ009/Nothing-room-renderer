"""Builds public/soundtrack.mp3 (narration + sound effects + music bed). Dev tool, run once; output is committed.
Needs the stickman skill's audio_kit (STICKMAN_SCRIPTS=/path/to/scripts)."""
import os, sys, subprocess
sys.path.insert(0, os.environ["STICKMAN_SCRIPTS"])
from audio_kit import Mix
DUR = 47.0
m = Mix(DUR, seed=11)
m.room_bed([(0,.6),(8,.7),(14,.3),(17,.5),(23,.35),(34,.12),(40,.1),(DUR,.08)])      # office hum, thins as he is isolated
m.drone([(0,0),(4,.1),(14,.25),(23,.35),(34,.6),(40,.4),(DUR,.1)])                   # low dread under the story
m.crowd(17.2,20.3,.12); m.crowd(20.3,33.0,.045)                                       # colleagues laughing behind glass
for i in range(10): m.step(8.7+i*.52, pan=-.2+.04*i, g=.2)                            # corridor walk
m.door_open(13.0, pan=.2); m.door_stop(13.8, pan=.2); m.door_stop(14.9, pan=0)        # nothing-room door opens, closes
m.chair_scrape(15.8, pan=-.2); m.cloth(16.2, 0, .1)
t = 14.3
while t < 40: m.tick(t, g=.04 if not 23.1<t<33.8 else .05, pan=.5); t += 1.0 if not 23.1<t<33.8 else .5
m.whoosh(4.7,g=.25); m.whoosh(23.1,d=1.4,g=.3); m.whoosh(40.7,g=.22)
m.sigh(25.4,.22); m.sigh(31.8,.22)
for b in (34.6,35.5,36.3): m.heart(b,.45)
m.cloth(38.0,0,.22); m.cloth(38.9,0,.15)                                              # paper slides across the desk
m.step(41.2,g=.16); m.step(41.8,g=.16); m.step(42.4,g=.14); m.door_stop(43.2,pan=.3)  # leaves
m.door_open(42.2,pan=.3); m.heart(44.3,.9)                                                                       # lights out
m.music(mood="sad", bpm=60, gain=.9)
m.voice("assets/narration.mp3", at=.3)
m.write("/tmp/nr_audio.wav")
subprocess.run(["ffmpeg","-y","-v","error","-i","/tmp/nr_audio.wav","-codec:a","libmp3lame","-b:a","160k","-af","loudnorm=I=-16:TP=-1.5:LRA=11","public/soundtrack.mp3"],check=True)
