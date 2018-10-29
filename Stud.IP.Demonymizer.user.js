// ==UserScript==
// @name     Stud.IP.Demonymizer
// @author   Tobias Thelen
// @version  1
// @grant    none
// ==/UserScript==

// Replace names and avatars of real Stud.IP users by pseudonymous names and avatars (from randomuser.me)
//
//

var $ = unsafeWindow.jQuery;


// define trim function
if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

// $(".avatar-small").attr("src", "https://randomuser.me/api/portraits/men/29.jpg");

function hash_name(n) {
  var firstnames=[['Johann', 'Ibrahim', 'Nils', 'John', 'Muhammed', 'Maxi', 'Malte', 'Tobias', 'Friedrich', 'Walter',
                   'Ulf', 'Renato', 'Juan', 'Werner-Gustav', 'Ralf', 'Rolf', 'Randolf', 'Gundolf', 'Jean', 'Rasmus',
                   'Friedrich', 'Bernd-Fritz', 'Alain', 'Thorsten', 'Maximilian', 'Till', 'Marko', 'Hendryk'],
                  ['Julia', 'Jana', 'Maxi', 'Martina', 'Inga', 'Tabea', 'Valeria', 'Tanja', 'Olga', 'Ruth', 
                   'Christina', 'Ingrid-Letizia', 'Berna', 'Ada', 'Dagmar', 'Franziska', 'Figura', 'Emma', 'Li', 'Mona',
                   'Analiz', 'Anna', 'Ana-Lisa', 'Hertha-Fortuna']];
  var lastnames=['Wahid', 'Meier', 'Kröger', 'Wurm', 'Baldfrüh', 'Gans', 'Elfmal', 'Demov', 'Özlem', 'Werther',
                'Berth', 'Schulte', 'Thomas', 'Waltminster', 'Brandmeister', 'Raddek', 'Loiben', 'Flügel', 'Hammer', 'Sicherl',
                'Specht', 'von Specht', 'Meisel', 'al-Thafaltha', 'vor dem Hufe', 'Brochtermens', 'Picard', 'Noir', 'Schwarz',
                'Black', 'Radek-Lubitsch', 'Mergentheimer', 'Feng', 'Grabbe', 'Müller-Isernhagen', 'Meier', 'Bayerlein',
                'Frischauf', 'Buelo', 'Garcia Hernandez', 'Jeroens', 'Traunicks', 'Fairley', 'Przcybylcky'];
  // add char values
  var name = n.trim();
  var val=1;
  for (var i = 0; i < name.length; i++) {
    val += (i+1)*name.charCodeAt(i);
  }
	
  // determine sex and names
  var sex = val%2; // 0 = male, 1=female
  var firstname = firstnames[sex][val%firstnames[sex].length];
  var lastname = lastnames[val%lastnames.length];
  
  // determine url
  var url="https://randomuser.me/api/portraits/" + ( sex ? "women" : "men") + "/" + val%97 + ".jpg";
  
  // return
  return [firstname+" "+lastname, url];
}

// changes name and avatar image in blubber posting
// removes new class (to make updating possible)
function demonymize_blubber(posting) {
	var name = $(posting).find(".name a")[0].innerText;
  var avatar = $(posting).find("div.avatar")[0];
  hashed = hash_name(name);
  $(avatar).html("<img style='width:50px; height:50px;' src='"+hashed[1]+"'>");
  posting.classList.remove("new");
}

// changes name in profile link (and adds avataar image if something with avatar is present)
// removes link to profile (to make updating possible)
function demonymize_profile_link(a) {
  var result = '';
  if (a.text.trim()=='') return; // sometimes, only an avatar image is linked
  hn = hash_name(a.text);
  
  if (a.innerHTML.includes("avatar")) {
      result+='<img style="margin-right: 5px" src="'+hn[1]+'" class="avatar-small recolor"> ';
  }
  
  a.innerHTML = result + hn[0];
  a.href = '#dummy';
}

// changes name and avatars in forum posting
function demonymize_forum_posting(posting) {
  console.log(posting);
	var name = $(posting).find('.postbody .title a[href*="profile"]');
  var name_right = $(posting).find('.username');
  var author = $(posting).find('.author');
  var avatar = $(posting).find('.avatar-medium');
  hashed = hash_name(name_right[0].innerText);
  name[0].innerHTML = "<img style='width:50px; height:50px;' src='"+hashed[1]+"'>" + hashed[0];
  name[0].href='#';
  name_right[0].innerHTML = hashed[0];
  name_right[0].parentNode.href = '#';
  $(author).html("Jemand schrieb");
  $(avatar).attr('src',hashed[1]);
  
}

// Forum
var forums = $("div.real_posting");
for (var i=0; i<forums.length; i++) { 
	demonymize_forum_posting(forums[i]);
}

// Blubber
var blubbers=$("li.posting");
for (var i=0; i<blubbers.length; i++) { 
	demonymize_blubber(blubbers[i]);
}


// normale Links zu Profilen
var name_links = $('a[href*="profile"]');
for (var i = 0; i < name_links.length; i++) {
  demonymize_profile_link(name_links[i]);
}


// Courseware Discussions
var avatars = $(".post-user");
for (var i=0; i<avatars.length; i++) { 
	var txt = avatars[i].text;
  var url="https://randomuser.me/api/portraits/" + ( Math.random() < .5 ? "men" : "women") + "/" + ( Math.floor( Math.random() * 99)) + ".jpg";
  $(avatars[i]).html("<img style='width:50px; height:50px;' src='" + url + "'> "); // + hash_name(txt) );
}

// Dateibereich
var name_links = $("table.documents tr td:nth-child(5)");
for (var i = 0; i < name_links.length; i++) {
  name_links[i].innerText = hash_name(name_links[i].innerText)[0];
}

// Vips solutions
if (window.location.href.includes("vipsplugin/solutions/assignment_solutions")) {
  	var names = $("table.default > tbody > tr > td:nth-child(2) > a");
    for (var i=0; i < names.length; i++) {
      names[i].innerText = hash_name(names[i].innerText)[0];
  }
}

var vips_breadcrumb_links = $('div.breadcrumb a');
if (vips_breadcrumb_links.length > 0) {
	console.log(vips_breadcrumb_links);
  if (vips_breadcrumb_links[1].text.trim() == '←') {
  	demonymize_profile_link(vips_breadcrumb_links[2]);
  } else {
  	demonymize_profile_link(vips_breadcrumb_links[1]);
  }
}

// updaters for ajax content
setInterval( function () { var name_links = $('a[href*="profile"]'); for (var i = 0; i < name_links.length; i++) { demonymize_profile_link(name_links[i]); }}, 100);
setInterval( function () { var blubbers=$("li.posting.new"); for (var i=0; i<blubbers.length; i++) { demonymize_blubber(blubbers[i]);}}, 100);

