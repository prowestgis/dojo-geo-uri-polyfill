define([
    "dojo/has",
    "dojo/Deferred",
    "dojo/on",
    "dojo/dom-attr",
    "dojo/sniff"
    ],
    function(has, Deferred, on, domAttr) {

        // Add a test to detect support for the geo: URI scheme[0]. Known support
        //
        // * Midori web browser >= 0.3.6
        // * Android
        //
        // [0] http://tools.ietf.org/rfc/rfc5870
        has.add("midori", function(global, document, element) {
            var re = /Midori\/([\d.]+)$/i;
            var match = re.exec(navigator.userAgent);

            return match ? match[1] : false;
        });

        // Ref: http://geouri.org/applications/
        has.add("geo-uri-scheme", function(global, document, element) {
            return (has("android") >= 2) || (has("midori") >= "1.3.6");
        });

        function isZero(x) {
            return (typeof x === "undefined" || x === "0" || x === "-0");
        }

        function openGoogleMaps(lat, lon, q) {
            var extra = (q && q.length > 0) ? ("&" + q) : "";
            var latlon = lat + "," + lon;
            window.location.href = "http://maps.google.com?near=" + latlon + "&ll=" + latlon + extra;
        }

        function _exception_toString() {
            return this.name + ": " + this.message;
        }

        function geolocation() {
            var deferred = new Deferred();
            if (navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    deferred.resolve(position);
                },
                function(e) {
                    deferred.reject(arguments);
                });
            }
            else {
                deferred.reject();
            }
            
            return deferred.promise;
        }

        // Test for geo: support and add a polyfill if it's not available. Only support wgs84 crs
        if (!has("geo-uri-scheme")) {
            
            // geo: polyfill
            on(document, "a[href^='geo:']:click", function(e) {
                
                // Prevent any default behavior
                e.preventDefault();

                // Get the href from the anchor element
                var geoURI = domAttr.get(e.target, "href");

                // Split the geo-URI into the geo-scheme and geo-path. Ignore the geoScheme as
                // it is always "geo:".
                var geoPath = "";
                (function(_) { geoPath = _[1]; })(geoURI.split(":"));

                // Split off an query string from the geoPath
                var queryString = "";
                (function(_) { geoPath = _[0]; queryString = _[1]; })(geoPath.split("?"));

                // Split the geoPath into coordinates, crsp, uncp and parameter pieces
                var coordinates = "", p = "";
                (function(_) { coordinates = _[0]; p = _.slice(1); })(geoPath.split(";"));

                // Extract the latitude, longitude and altitude.  Altitude is optional.
                var latitude = "", longitude = "", altitude = "";
                (function(_) { latitude = _[0]; longitude = _[1]; altitude = _[2]; })(coordinates.split(","));

                // Parse the p-array. The crs and uncp MUST come before anything else.  We only care about 
                // the crs field and throw an exception if it is set and not equal to wgs84.
                for (var idx = 0; idx < p.length; idx++) {
                    if (p[idx].indexOf("crs=") === 0) {
                        var crslabel = p[idx].split("=")[1];
                        if (crslabel !== "wgs84") {
                            throw { 
                                name: "Coordinate Reference System Error",
                                message: "Only the WGS-84 CRS is supported",
                                toString: _exception_toString
                            };
                        }
                    }
                    if (p[idx].indexOf("u=") === 0) {
                        // Unused
                    }
                }

                // Android Extension: if the lat/lon is equal to 0,0 or undefined, then assume we mean 
                // "current location". The RFC defines "0" === "-0".
                if (isZero(latitude) && isZero(longitude)) {
                    geolocation().then(function(geo) {
                        openGoogleMaps(geo.coords.latitude, geo.coords.longitude, queryString);
                    });
                }
                else {
                    openGoogleMaps(latitude, longitude, queryString);
                }
            });
        }
    }
);
