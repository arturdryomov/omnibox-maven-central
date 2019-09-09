package:
	@cd src && zip --recurse-paths extension.zip * && mv extension.zip ..

clean:
	@rm -f extension.zip
