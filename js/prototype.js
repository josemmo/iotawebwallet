String.prototype.toHTML = function() {
  return $('<div>').text(this).html();
};
