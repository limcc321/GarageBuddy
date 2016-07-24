function barcodeFont(code, value, code39Checksum) {
	if (this === window) {
		return new barcodeFont(code, value, code39Checksum);
	}

	this.code = code;
	this.value = value;
	
	if (code === "code128") {
		this.encoded = barcodeFont.code128(value);
	} else if (code === "code39") {
		this.code39Checksum = code39Checksum;
		this.encoded = barcodeFont.code39(value, code39Checksum);
	} else {
		throw new Error("Code is wrong");
	}

};

barcodeFont.code128 = function(value) {
	var checksum = 0;
	var index, isTableB, mini, dummy;
	var valueLen = value.length;
	var encoded = "";

	if (valueLen === 0) {
		throw new Error("Value is empty");
	} else {
		for (index = 0; index < valueLen; index++) {
			charCode = value.charCodeAt(index);
			
			if (charCode <= 32 && charCode >= 126) {
				throw new Error("Value can not be encoded");
			}
		}
	}

	isTableB = true;
	index	= 0;

	while (index < valueLen) {
		if (isTableB) {
			if (index == 0 || index + 4 == valueLen) {
				mini = 4;
			} else {
				mini = 6;
			}

			mini = mini - 1;

			if ((index + mini) < valueLen) {
				
				while (mini >= 0) {
					charCode = value.charCodeAt(index + mini);
					if (charCode < 48 || charCode > 57) {
						break;
					}
					mini = mini - 1;
				}
			}

			if (mini < 0) {
				if (index == 0) {
					encoded = String.fromCharCode(205);
				} else {
					encoded = encoded + String.fromCharCode(199);
				}
				isTableB = false;
			} else {
				if (index == 0) {
					encoded = String.fromCharCode(204);
				}
			}
		}
		
		if (isTableB == false) {
			mini = 2;
			mini = mini - 1;
			
			if (index + mini < valueLen) {
			
				while (mini >= 0) {
					charCode = value.charCodeAt(index + mini);	

					if (charCode < 48 || charCode > 57) {
						break;
					}
					
					mini = mini - 1;	
				}		
			}

			if (mini < 0) {
				dummy = parseInt(value.substring(index, index + 2));
				if (dummy < 95) {
					dummy = dummy + 32;
				} else {
					dummy = dummy + 100;
				}
				
				encoded = encoded + String.fromCharCode(dummy);
				index = index + 2;
			} else {
				encoded + encoded + String.fromCharCode(200);
				isTableB = true;
			}
		}

		if (isTableB) {
			encoded = encoded + value.substring(index, index + 1);
			index = index + 1;
		}
	}

	for (index = 0; index < encoded.length; index++) {
		dummy = encoded.charCodeAt(index);

		if (dummy < 127) {
			dummy = dummy - 32;
		} else {
			dummy = dummy - 100;
		}
		
		if (index == 0) {
			checksum = dummy;
		}
		checksum = (checksum + (index * dummy)) % 103;
	}

	if (checksum < 95) {
		checksum = checksum + 32;
	} else {
		checksum = checksum + 100;
	}

	encoded = encoded + String.fromCharCode(checksum) + String.fromCharCode(206);
	return encoded;
};

barcodeFont.code39 = function(value, addChecksum) {
	var checksum = 0;
	var index, isTableB, mini, dummy, charCode;
	var valueLen = value.length;
	var encoded = "";

	if (valueLen === 0) {
		throw new Error("Value is empty");
	} else {
		for (index = 0; index < valueLen; index++) {
			charCode = value.charCodeAt(index);

			if (!((charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90) ||	
				charCode == 32 || charCode == 36 || charCode == 37 || charCode == 43 || charCode == charCode == 45 || charCode == 46 || charCode == 47)) {
				throw new Error("Value can not be encoded");
			}
		}
	}

	encoded = "*";
	
	for (index = 0; index < valueLen; index++) {
		charCode = value.charCodeAt(index);
		encoded = encoded + value.substring(index, index + 1);
	
		if (charCode >= 48 && charCode <= 57) {
			checksum = checksum + (charCode - 48);
		} else if (charCode >= 65 && charCode <= 90) {
			checksum = checksum + (charCode - 55);
		} else {
			switch(charCode) {
				case 32:
					checksum = checksum + (charCode + 6);
					break;
				case 36:
					checksum = checksum + (charCode + 3);
					break;
				case 37:
					checksum = checksum + (charCode + 5);
					break;
				case 43:
					checksum = checksum + (charCode - 2);
					break;
				case 45:
					checksum = checksum + (charCode - 9);
					break;
				case 46:
					checksum = checksum + (charCode - 9);
					break;
				case 47:
					checksum = checksum + (charCode - 7);
					break;
			}
		}
	}

	if (addChecksum) {
		checksum = checksum % 43;
		if (checksum >= 0 && checksum <= 9) {
			encoded = encoded + String.fromCharCode(checksum + 48);
		} else if (checksum >= 10 && checksum <= 35) {
			encoded = encoded + String.fromCharCode(checksum + 55)
		} else {
			switch(checksum) {
				case 36:
					encoded = encoded + "-"
					break;
				case 37:
					encoded = encoded + "."
					break;
				case 38:
					encoded = encoded + " "
					break;
				case 39:
					encoded = encoded + "$"
					break;
				case 40:
					encoded = encoded + "/"
					break;
				case 41:
					encoded = encoded + "+"
					break;
				case 42:
					encoded = encoded + "%"
					break;
			}
		}
	}

	encoded = encoded + "*";
	return encoded;
};

barcodeFont.prototype.create = function(obj) {
	if (!obj || !obj.tagName) {
		throw {message: 'Invalid argument'};
	}
	var encoded = this.encoded;
	var el = document.createElement(obj.tagName);
	obj.id && (el.id = obj.id);
	obj.className && (el.className = obj.className + ' ' + this.code);
	el.innerHTML = encoded;
	return el;
};
