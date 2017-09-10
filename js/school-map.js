
var xhttp = new XMLHttpRequest();
var data = null;
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        data = JSON.parse(this.responseText);
        schoolMap.change();
    }
};

var schoolMap = {};

schoolMap.schools = null;
schoolMap.map = null;
schoolMap.markerClusterer = null;
schoolMap.markers = [];
schoolMap.infoWindow = null;
schoolMap.schoolType = 'primarySchools';

var geocoder = new google.maps.Geocoder();
schoolMap.init = function() {
    var latlng = new google.maps.LatLng(53.498490, -1.198917);
    var options = {
        'zoom': 6,
        'center': latlng,
        'mapTypeId': google.maps.MapTypeId.ROADMAP
    };
    schoolMap.map = new google.maps.Map(document.getElementById('map'), options);
    schoolMap.infoWindow = new google.maps.InfoWindow();
};

schoolMap.searchByPostcode = function(postcode){
    geocoder.geocode({address: postcode}, function(results, status){
        if (status == 'OK'){
            var place = results[0];
            var latlng = place.geometry.viewport.getCenter();
            schoolMap.map.panTo(latlng);
            schoolMap.map.setZoom(12);
            document.querySelector('#school-results table tbody').innerHTML = '<tr><td colspan="4" class="text-center"><img src="images/loading.gif" width="50"></td></tr>'
            xhttp.open("GET", "ajax.php?postcode="+postcode, true);
            xhttp.send();
        }
    });
}

schoolMap.showMarkers = function() {
    schoolMap.markers = [];

    if (schoolMap.markerClusterer) {
        schoolMap.markerClusterer.clearMarkers();
    }

    var results = document.querySelector('#school-results table tbody');
    results.innerHTML = '';

    for (var i = 0; i < schoolMap.schools.length; i++) {
        var school = schoolMap.schools[i];
        var rating = school.schoolRating?(school.schoolRating.body+': '+school.schoolRating.label):'';
        var row = document.createElement('TR');
        row.innerHTML = '<td class="text-center">'+(i+1)+'</td>'
            +'<td><a href="javascript:;" class="school-name">'+school.name+'</a></td>'
            +'<td>'+rating+'</td>'
            +'<td>'+school.type+' - '+school.subType+'</td>';

        results.appendChild(row);

        var latLng = new google.maps.LatLng(schoolMap.schools[i].latitudeLongitude.lat,
            schoolMap.schools[i].latitudeLongitude.lng);

        var imageUrl = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+(i+1)+'|FF3000|FFFFFF';
        var markerImage = new google.maps.MarkerImage(imageUrl,
            new google.maps.Size(24, 32));

        var marker = new google.maps.Marker({
            'position': latLng,
            'icon': markerImage
        });

        var fn = schoolMap.markerClickFunction(schoolMap.schools[i], marker);
        google.maps.event.addListener(marker, 'click', fn);
        google.maps.event.addDomListener($(row).find('.school-name')[0], 'click', fn);
        schoolMap.markers.push(marker);
    }
    //Draw markers
    // schoolMap.markerClusterer = new MarkerClusterer(schoolMap.map, schoolMap.markers, { imagePath: 'images/m' });
    for (var i = 0, marker; marker = schoolMap.markers[i]; i++) {
        marker.setMap(schoolMap.map);
    }
};

schoolMap.markerClickFunction = function(school, marker) {
    return function(e) {
        e.cancelBubble = true;
        e.returnValue = false;
        if (e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }

        var infoHtml = '<div class="info">'+
            '<h4>' + school.name + '</h4>'+
            '<div class="info-body">' +
            '<b>Address: </b>'+school.address+'<br>'+
            '<b>Minimum Age: </b>'+school.minimumAge+'<br>'+
            '<b>Maximum Age: </b>'+school.maximumAge+'<br>'+
            '</div></div>';

        schoolMap.infoWindow.setContent(infoHtml);
        schoolMap.infoWindow.open(schoolMap.map, marker);
        schoolMap.map.panTo(marker.position);
        schoolMap.map.setZoom(14);
    };
};

schoolMap.clear = function() {
    for (var i = 0, marker; marker = schoolMap.markers[i]; i++) {
        marker.setMap(null);
    }
};

schoolMap.change = function() {
    schoolMap.clear();
    if (data){
        schoolMap.schools = data[schoolMap.schoolType];
        schoolMap.showMarkers();
    }
};

jQuery(document).ready(function($){
    schoolMap.init();
    $('.school-type button').click(function(){
        $('.school-type button').removeClass('active');
        $(this).addClass('active');
        schoolMap.schoolType = $(this).data('type');
        schoolMap.change();
    });

    //Search by postcode
    $('form.postcode-search').submit(function(e){
        e.preventDefault();
        var postcode = $('#postcode').val();
        schoolMap.searchByPostcode(postcode);
    });
});

