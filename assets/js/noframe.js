/* the payment pages never run inside another site's frame */
if(window.top!==window.self){document.documentElement.style.visibility="hidden";try{window.top.location.replace(location.href)}catch(e){}}
