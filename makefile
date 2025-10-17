package:
    -rm -rf dist/
    npm run build:mac
    @echo "Artifacts are in dist/ (macOS DMG/ZIP for x64 and arm64). Windows/Linux artifacts are produced by GitHub Actions. Tag a commit to trigger release."
.PHONY: package
