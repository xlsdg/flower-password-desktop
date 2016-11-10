publish:
	-rm -rf dist/FlowerPassword-darwin-x64/FlowerPassword.app dist/FlowerPassword-darwin-x64/FlowerPassword.zip
	npm run build
	@# ditto creates a much better compressed zip file compared to the zip command
	@# these flags come from ditto's man page on how to create an archive in the
	@# same manner as Finder's compress option
	ditto -c -k --sequesterRsrc --keepParent dist/FlowerPassword-darwin-x64/FlowerPassword.app FlowerPassword.zip
	npm run publish
.PHONY: publish
