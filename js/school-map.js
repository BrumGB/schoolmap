var xhttp = new XMLHttpRequest();
var data = null;
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        data = JSON.parse(this.responseText);
        schoolMap.init();
    }
};
xhttp.open("GET", "ajax.php?lat=-28.024&lng=140.887", true);
xhttp.send();

function $(element) {
    return document.getElementById(element);
}

var schoolMap = {};

schoolMap.schools = null;
schoolMap.map = null;
schoolMap.markerClusterer = null;
schoolMap.markers = [];
schoolMap.infoWindow = null;
schoolMap.schoolType = 'primarySchools';

schoolMap.init = function() {
    var latlng = new google.maps.LatLng(-28.024, 140.887);
    var options = {
        'zoom': 2,
        'center': latlng,
        'mapTypeId': google.maps.MapTypeId.ROADMAP
    };
	schoolMap.schools = data[schoolMap.schoolType];
    schoolMap.map = new google.maps.Map($('map'), options);

    var useGmm = document.getElementById('usegmm');
    google.maps.event.addDomListener(useGmm, 'click', schoolMap.change);

    var numMarkers = document.getElementById('nummarkers');
    google.maps.event.addDomListener(numMarkers, 'change', schoolMap.change);

    schoolMap.infoWindow = new google.maps.InfoWindow();

    schoolMap.showMarkers();
};

schoolMap.showMarkers = function() {
    schoolMap.markers = [];

    var type = 1;
    if ($('usegmm').checked) {
        type = 0;
    }

    if (schoolMap.markerClusterer) {
        schoolMap.markerClusterer.clearMarkers();
    }

    var panel = $('markerlist');
    panel.innerHTML = '';
    var numMarkers = $('nummarkers').value;

    for (var i = 0; i < schoolMap.schools.length; i++) {
        var titleText = schoolMap.schools[i].name;
        if (titleText === '') {
            titleText = 'No title';
        }

        var item = document.createElement('DIV');
        var title = document.createElement('A');
        title.href = '#';
        title.className = 'title';
        title.innerHTML = titleText;

        item.appendChild(title);
        panel.appendChild(item);


        var latLng = new google.maps.LatLng(schoolMap.schools[i].latitudeLongitude.lat,
            schoolMap.schools[i].latitudeLongitude.lng);

        var imageUrl = 'http://chart.apis.google.com/chart?cht=mm&chs=24x32&chco=' +
            'FFFFFF,008CFF,000000&ext=.png';
        var markerImage = new google.maps.MarkerImage(imageUrl,
            new google.maps.Size(24, 32));

        var marker = new google.maps.Marker({
            'position': latLng,
            'icon': markerImage
        });

        var fn = schoolMap.markerClickFunction(schoolMap.schools[i], latLng);
        google.maps.event.addListener(marker, 'click', fn);
        google.maps.event.addDomListener(title, 'click', fn);
        schoolMap.markers.push(marker);
    }
    window.setTimeout(schoolMap.time, 0);
};

schoolMap.markerClickFunction = function(pic, latlng) {
    return function(e) {
        e.cancelBubble = true;
        e.returnValue = false;
        if (e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }
        var title = pic.photo_title;
        var url = pic.photo_url;
        var fileurl = pic.photo_file_url;

        var infoHtml = '<div class="info"><h3>' + title +
            '</h3><div class="info-body">' +
            '<a href="' + url + '" target="_blank"><img src="' +
            fileurl + '" class="info-img"/></a></div>' +
            '<a href="http://www.panoramio.com/" target="_blank">' +
            '<img src="http://maps.google.com/intl/en_ALL/mapfiles/' +
            'iw_panoramio.png"/></a><br/>' +
            '<a href="' + pic.owner_url + '" target="_blank">' + pic.owner_name +
            '</a></div></div>';

        schoolMap.infoWindow.setContent(infoHtml);
        schoolMap.infoWindow.setPosition(latlng);
        schoolMap.infoWindow.open(schoolMap.map);
    };
};

schoolMap.clear = function() {
    $('timetaken').innerHTML = 'cleaning...';
    for (var i = 0, marker; marker = schoolMap.markers[i]; i++) {
        marker.setMap(null);
    }
};

schoolMap.change = function() {
    schoolMap.clear();
    schoolMap.showMarkers();
};

schoolMap.time = function() {
    $('timetaken').innerHTML = 'timing...';
    var start = new Date();
    if ($('usegmm').checked) {
        schoolMap.markerClusterer = new MarkerClusterer(schoolMap.map, schoolMap.markers, { imagePath: 'images/m' });
    } else {
        for (var i = 0, marker; marker = schoolMap.markers[i]; i++) {
            marker.setMap(schoolMap.map);
        }
    }

    var end = new Date();
    $('timetaken').innerHTML = end - start;
};