var getDescription = function() {
  var text = $('p').first().text().substring(0, 200);
  return $('meta[property="og:description"]').text() || $('meta[name=description]').prop('content') || (text.length > 0 ? text + '...' : false) || '';
};

var getDetails = function() {
  var data = {
    title: $('meta[property="og:title"]').prop('content') || document.title || $('h1').first().text() || '',
    description: getDescription()
  };
  return data;
};