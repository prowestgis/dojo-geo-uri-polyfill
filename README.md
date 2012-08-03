dojo-geo-uri-polyfill
=====================

A small dojo AMD module to add support for the geo: URI scheme

Usage
-----

Just include the polyfill module from some location in your application.  The module will install a delegated event
handler to intercept an clicks to anchor elements with a "geo:" URI scheme.

Currently, only Google Maps is used for the service provider.  We implement the Android intent interface, so
that query strings can be attatched to the URI and undefined (or zero) latitude and longitude values are
interpreted as "current position" and try to use the Geolocation API to fetch the user's position.

Example
-------

    <head>
       <script type="text/javascript">
          require(["my/app/geo-uri/polyfill"], function(polyfill) {
             // Nothing to do....
          });
       </script>
    </head>
    <body>
        <a href="geo:">My Location</a>
        <a href="geo:?q=police">Local Police</a>
        <a href="geo:0,0?q=police">Local Police</a>
        <a href="geo:37.77,-122.41?q=starbucks&z=12">San Francisco Starbucks</a>
        <a href="geo:37.77,-122.41;crs=wgs84?q=starbucks&z=12">Good URL</a>
        <a href="geo:37.77,-122.41;crs=nad83?q=starbucks&z=12">Bad URL</a>
    </body>