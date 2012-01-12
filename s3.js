/**
 * S3 Module
 * - Generates temporary signatures for a simple GET request
 * Adapted from https://gist.github.com/1370593
 * @author Jiunn Haur Lim
 */
  
var	crypto = require('crypto');

process.on('uncaughtException', function (err) {
  console.log('warning! uncaught exception: ' + err);
});
 
/* 
 * Amazon S3 signing algorithm (pre-signed version):
 * http://docs.amazonwebservices.com/AmazonS3/latest/dev/RESTAuthentication.html#RESTAuthenticationQueryStringAuth
 *
 * GET <URL>?AWSAccessKeyId=...&Expires=...&Signature=...
 * 
 * Signature = URL-Encode( Base64( HMAC-SHA1( YourSecretAccessKeyID, UTF-8-Encoding-Of( StringToSign ) ) ) );
 * 
 * StringToSign = HTTP-VERB + "\n" +
 *   Content-MD5 + "\n" +
 *   Content-Type + "\n" +
 *   Expires + "\n" +
 *   CanonicalizedAmzHeaders +
 *   CanonicalizedResource;
 */

var S3 = function(awsAccessKey, awsSecretKey, options){
	this._awsSecretKey = awsSecretKey;
	this._awsAccessKey = awsAccessKey;
};

S3.prototype.constructor = S3;

S3.prototype.getQueryString = function (host, bucketName, fileName){

  var response_headers =  'response-content-disposition=attachment' + '&' +
                          'response-content-type=binary/octet-stream';
  
  var fileName = encodeURIComponent(fileName);
  var resource = '/' + bucketName +
                 '/' + fileName +
                 '?' + response_headers;
  var expires = this._getExpires();
  
  var signature = this._getSignature (resource, expires);
  return  'http://' + host +
          '/' + fileName + '?' +
          'AWSAccessKeyId=' + this._awsAccessKey + '&' +
          'Expires=' + expires + '&' +
          'Signature=' + signature + '&' + 
          response_headers;
  
};

/**
 * Expires five minutes from now.
 * @return number of seconds since epoch
 */
S3.prototype._getExpires = function (){
  var d = new Date();
  return Math.ceil(d.getTime()/1000) + 5*60;
};

/**
 * Creates a URL-encoded HMAC signature for the S3 request.
 * URL-Encode( Base64( HMAC-SHA1( StringToSign ) ) )
 */
S3.prototype._getSignature = function (resource, expires){
  var stringToSign = "GET\n\n\n" + expires + "\n" + resource;
  var hmac = crypto.createHmac('sha1', this._awsSecretKey);
	hmac.update(stringToSign);
	return encodeURIComponent(hmac.digest('base64'));
};

// export the s3 library
exports.S3 = S3;