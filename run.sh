docker build -t quadlink .  &&
docker run -p 4000:4000 -v "$(pwd)":/app quadlink 