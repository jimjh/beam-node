/**
 * S3 Module
 * - Generates temporary signatures for a simple GET request
 * Adapted from https://gist.github.com/1370593
 * @author Jiunn Haur Lim
 */
  
var	crypto = require('crypto');
var querystring = require('querystring');
var url = require('url');

process.on('uncaughtException', function (err) {
  // TODO: send email!
  console.warn('Uncaught exception: ' + err);
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

//---------------------------------------------------------------------
// PUBLIC
//---------------------------------------------------------------------

var S3 = function(awsAccessKey, awsSecretKey, options){
	this._awsSecretKey = awsSecretKey;
	this._awsAccessKey = awsAccessKey;
};

/** @const number of seconds before the pre-signed URL expires */
const EXPIRY_DURATION = 5*60;

/** @const response headers for Amazon S3 (attach to end of query string) */
const RESPONSE_HEADERS = 
  querystring.stringify({
    'response-content-disposition': 'attachment',
    'response-content-type' : 'binary/octet-stream'});

S3.prototype.constructor = S3;

/**
 * Returns a pre-signed query to retrieve a file from Amazon S3.
 * @param {String}  host        virtual host for Amazon S3 bucket
 * @param {String}  bucketName  name of Amazon S3 bucket
 * @param {String}  fileName    name of file to download
 */
S3.prototype.getQueryString = function (host, bucketName, fileName){
  
  var fileName = encodeURIComponent(fileName);
  var resource = '/' + bucketName +
                 '/' + fileName +
                 '?' + RESPONSE_HEADERS;
                 
  var accessKey = this._awsAccessKey;
  var expires = this._getExpires();
  var signature = this._getSignature (resource, expires);
  
  var params = {
    AWSAccessKeyId : accessKey,
    Expires : expires,
    Signature : signature
  }
  
  return url.format({
    host: host,
    pathname: fileName,
    query: query.stringify(params) + RESPONSE_HEADERS
  });
  
};

//---------------------------------------------------------------------
// PRIVATE
//---------------------------------------------------------------------

/**
 * Returns the time that is (now + EXPIRY DURATION) as a UNIX timestamp.
 * Since Javascript gives it to us in milliseconds, it's rounded up to
 * the nearest second.
 * @return number of seconds since epoch
 */
S3.prototype._getExpires = function (){
  var d = new Date();
  return Math.ceil(d.getTime()/1000) + EXPIRY_DURATION;
};

/**
 * Creates a URL-encoded HMAC signature for the S3 request.
 * URL-Encode( Base64( HMAC-SHA1( StringToSign ) ) )
 * @param {String}  resource    canonicalized resource name
 * @param {Int}     expires     time when signature expires, in number of seconds
 *                              since epoch
 * @return URI-encoded HMAC digest
 */
S3.prototype._getSignature = function (resource, expires){
  var stringToSign = "GET\n\n\n" + expires + "\n" + resource;
  var hmac = crypto.createHmac('sha1', this._awsSecretKey);
	hmac.update(stringToSign);
	return encodeURIComponent(hmac.digest('base64'));
};

// export the s3 library
exports.S3 = S3;