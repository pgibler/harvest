// 
// Works only for PDF 1.5 (Acrobat 6.0 and later)
// @param certificate: your pdf form (format of this variable must be compatible with FileReader)
// @param changes: the field changes, [{find: '%address%', replace: '2386 5th Street, New York, USA'}, ...]
var fillCertificate = function (certificate, changes) {
  // replace a a substring at a specific position
  String.prototype.replaceBetween = function(start, end, what) {
      return this.substring(0, start) + what + this.substring(end);
  };
  // format number with zeros at the beginning (n is the number and length is the total length)
  var addLeadingZeros = function (n, length) {
      var str = (n > 0 ? n : -n) + "";
      var zeros = "";
      for (var i = length - str.length; i > 0; i--)
          zeros += "0";
      zeros += str;
      return n >= 0 ? zeros : "-" + zeros;
  }

  // Create the reader first and read the file (call after the onload method)
  var reader = new FileReader();
  // To change the content of a field, three things must be done; - change the text of the field, - change the length of the content field, - change the cross table reference
  reader.onload = function(aEvent) {
      var string = aEvent.target.result;

      // Let's first change the content and the content's length
      var arrayDiff = [];
      var char;
      for(var foo = 0; foo < changes.length; foo++) {
          // Divide the string into a table of character for finding indices
          char = new Array(string.length);
          for (var int = 0; int < string.length; int++) {
              char[int] = string.charAt(int);
          }
          // Let's find the content's field to change and change it everywhere
          var find = changes[foo].find;
          var replace = changes[foo].replace;
          var lengthDiff = replace.length - find.length;
          var search = new RegExp(find, "g");

          var match;
          var lastElements = [];
          var int = 0;
          var objectLenPos;
          var objectLenEnd;
          // Each time you change the content, compute the offset difference (number of characters). We'll add it later for the cross tables
          while (match = search.exec(string)) {
              arrayDiff.push({index: match.index, diff: lengthDiff});
              lastElements.push({index: match.index, diff: lengthDiff});
              // Find length object
              if(int == 0){
                  var length = 0;
                  var index;
                  while(char[match.index - length] != '\r'){
                      index = match.index - length;
                      length++;
                  }
                  objectLenPos = index + 10;
                  length = 0;
                  while(char[objectLenPos + length] != ' '){
                      length++;
                      objectLenEnd = objectLenPos + length;
                  }
              }
              int++;
          }
          var lengthObject = string.slice(objectLenPos, objectLenEnd) + ' 0 obj';

          var objectPositionStart = string.search(new RegExp('\\D' + lengthObject, 'g')) + lengthObject.toString().length + 2;
          var length = 0;
          var objectPositionEnd;
          while(char[objectPositionStart + length] != '\r'){
              length++;
              objectPositionEnd = objectPositionStart + length;
          }

          // Change the length of the content's field

          var lengthString = new RegExp('Length ', "g");
          var fieldLength;
          var newLength;

          string = string.replace(lengthString, function (match, int) {
              // The length is between the two positions calculated above
              if (int > objectPositionStart && int < objectPositionEnd) {
                  var length = 0;
                  var end;
                  while (char[int + 7 + length] != '/') {
                      length++;
                      end = int + 7 + length;
                  }
                  fieldLength = string.slice(end - length, end);
                  newLength = parseInt(fieldLength) + lengthDiff;

                  if (fieldLength.length != newLength.toString().length) {
                      arrayDiff.push({index: int, diff: (newLength.toString().length - fieldLength.length)});
                  }
                  // Let's modify the length so it's easy to find and replace what interests us; the length number itself
                  return "Length%";
              }
              return match;
          });

          // Replace the length with the new one based on the length difference
          string = string.replace('Length%' + fieldLength, 'Length ' + (newLength).toString());
          string = string.replace(new RegExp(find, 'g'), replace);
      }

      // FIND xref and repair cross tables
      // Rebuild the table of character
      var char = new Array(string.length);
      for (var int = 0; int < string.length; int++) {
          char[int] = string.charAt(int);
      };
      // Find XRefStm (cross reference streams)
      var regex = /XRefStm/g, result, indices = [];
      while ( (result = regex.exec(string)) ) {
          indices.push(result.index);
      }
      // Get the position of the stream
      var xrefstmPositions = [];
      for(var int = 0; int < indices.length; int++){
          var start;
          var length = 0;
          while(char[indices[int] - 2 - length] != ' '){
              start = indices[int] - 2 - length;
              length++;
          }
          var index = parseInt(string.slice(start, start + length));
          var tempIndex = parseInt(string.slice(start, start + length));
          // Add the offset (consequence of the content changes) to the index
          for(var num = 0; num < arrayDiff.length; num++){
              if(index > arrayDiff[num].index){
                  index = index + arrayDiff[num].diff;
              }
          }
          string = string.replaceBetween(start, start + length, index);
          // If there is a difference in the string length then update what needs to be updated
          if(tempIndex.toString().length != index.toString().length){
              arrayDiff.push({index: start, diff: (index.toString().length - tempIndex.toString().length)});
              char = new Array(string.length);
              for (var int = 0; int < string.length; int++) {
                  char[int] = string.charAt(int);
              };
          }

          xrefstmPositions.push(index);
      }
      // Do the same for non-stream
      var regex = /startxref/g, result, indices = [];
      while ( (result = regex.exec(string)) ) {
          indices.push(result.index);
      }
      for(var int = 0; int < indices.length; int++){
          var end;
          var length = 0;
          while(char[indices[int] + 11 + length] != '\r'){
              length++;
              end = indices[int] + 11 + length;
          }
          var index = parseInt(string.slice(end - length, end));
          var tempIndex = parseInt(string.slice(end - length, end));

          for(var num = 0; num < arrayDiff.length; num++){
              if(index > arrayDiff[num].index){
                  index = index + arrayDiff[num].diff;
              }
          }
          string = string.replaceBetween(end - length, end, index);

          if(tempIndex.toString().length != index.toString().length){
              arrayDiff.push({index: end - length, diff: (index.toString().length - tempIndex.toString().length)});
              char = new Array(string.length);
              for (var int = 0; int < string.length; int++) {
                  char[int] = string.charAt(int);
              };
          }

          xrefstmPositions.push(index);
      }
      xrefstmPositions.reverse();
      var firstObject, objectLength, end;
      var offset;
      // Updated the cross tables
      for(var int = 0; int < xrefstmPositions.length; int++) {
          var length = 0;
          var end;
          if(char[xrefstmPositions[int]] == 'x'){
              offset = 6;
          } else{
              offset = 0;
          }
          // Get first object index (read pdf documentation)
          while(char[xrefstmPositions[int] + offset + length] != ' '){
              length++;
              end = xrefstmPositions[int] + offset + length;
          }
          firstObject = string.slice(end - length, end);

          // Get length of objects (read pdf documentation)
          length = 0;
          while(char[xrefstmPositions[int] + offset + 1 + firstObject.length + length] != '\r'){
              length++;
              end = xrefstmPositions[int] + offset + 1 + firstObject.length + length;
          }
          objectLength = string.slice(end - length, end);

          // Replace the offset by adding the differences from the content's field
          for(var num = 0; num < objectLength; num++){
              if(char[xrefstmPositions[int]] == 'x'){
                  offset = 9;
              } else{
                  offset = 3;
              }
              // Check if it's an available object
              if (char[xrefstmPositions[int] + 17 + offset + firstObject.length + objectLength.length + (num * 20)] == 'n') {
                  var objectCall = (parseInt(firstObject) + num).toString() + " 0 obj";
                  var regexp = new RegExp('\\D' + objectCall, "g");
                  var m;
                  var lastIndexOf;
                  // Get the last index in case an object is created more than once. (not very accurate and can be improved)
                  while (m = regexp.exec(string)) {
                      lastIndexOf = m.index;
                  }
                  string = string.replaceBetween(xrefstmPositions[int] + offset + firstObject.length + objectLength.length + (num * 20), xrefstmPositions[int] + 10 + offset + firstObject.length + objectLength.length + (num * 20), addLeadingZeros(lastIndexOf + 1, 10));
              }
              if(num == objectLength - 1){
                  if (char[xrefstmPositions[int] + offset + firstObject.length + objectLength.length + ((num + 1) * 20)] != 't'){
                      xrefstmPositions.push(xrefstmPositions[int] + offset + firstObject.length + objectLength.length + ((num + 1) * 20));
                  }
              }
          }
      }

      // create a blob from the string
      var byteNumbers = new Array(string.length);
      for (var int = 0; int < string.length; int++) {
          byteNumbers[int] = string.charCodeAt(int);
      }

      var byteArray = new Uint8Array(byteNumbers);

      var blob = new Blob([byteArray], {type : 'application/pdf'});

      // Do whatever you want with the blob here

  };

  reader.readAsBinaryString(certificate);

}

module.exports = fillCertificate;