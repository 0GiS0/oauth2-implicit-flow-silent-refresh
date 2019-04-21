//Variables
var access_token = getParameterByName('access_token', window.location.hash),
    interval;

function element(id) {
    return document.getElementById(id);
}

function getParameterByName(name, where) {
    var match = RegExp('[#&]' + name + '=([^&]*)').exec(where);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

//It decodes the content of the token
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
};

function showAccessToken() {
    element('access_token').innerText = JSON.stringify(parseJwt(access_token), undefined, 2);
}


function whenTheTokenWillExpire() {
    let expirationDate = new Date(0);
    expirationDate.setUTCSeconds(parseJwt(access_token).exp); //This is the date when the token will expire

    interval = setInterval(function () {
        let date_now = new Date();

        seconds = Math.floor((expirationDate - (date_now)) / 1000);
        minutes = Math.floor(seconds / 60);
        hours = Math.floor(minutes / 60);
        days = Math.floor(hours / 24);

        hours = hours - (days * 24);
        minutes = minutes - (days * 24 * 60) - (hours * 60);
        seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

        element('expiresAt').innerText = `${hours} hours ${minutes} minutes ${seconds} seconds`;

    }, 1000);
}

//Show token's info and when it will expire
function DisplayInfo() {
    showAccessToken();
    whenTheTokenWillExpire();
}

// Use the Access Token to make API calls
element('btnCallAPI').addEventListener('click', async () => {

    let result = element('result');

    const Microsoft_Graph_Endpoint = 'https://graph.microsoft.com/beta';
    const Acction_That_I_Have_Access_Because_Of_My_Scope = '/me';

    fetch(`${Microsoft_Graph_Endpoint}${Acction_That_I_Have_Access_Because_Of_My_Scope}`, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    }).then(async (response) => {

        let json = await response.json();
        result.innerHTML = JSON.stringify(json, undefined, 2);

    }).catch(error => {
        result.innerText = error.message;
    });

    result.style.display = 'block';

});

//Use to refresh the token
element('btnSilentRefresh').addEventListener('click', silentRefresh);

function silentRefresh() {

    const iframe_id = 'silent-refresh-iframe';

    //Remove iframe if exists
    let old_iframe = element(iframe_id);

    if (old_iframe)
        document.body.removeChild(old_iframe);

    //Create an iframe
    const iframe = document.createElement('iframe');
    iframe.id = iframe_id;

    //create login URL
    const Authorization_Endpoint = `https://login.microsoftonline.com/${config.tenantId}/oauth2/authorize?`;
    const Response_Type = config.response_type;
    const Client_Id = config.client_id;
    const Redirect_Uri = window.location.origin + '/silent-refresh.html';
    const Scope =  config.scope;
    const Resource = config.resource;
    const State = config.state;
    const Prompt = 'none';

    const url = `${Authorization_Endpoint}?response_type=${Response_Type}&client_id=${Client_Id}&redirect_uri=${Redirect_Uri}&scope=${Scope}&resource=${Resource}&state=${State}&prompt=${Prompt}`;

    iframe.setAttribute('src', url);

    //Hide iframe
    iframe.style.display = 'none';

    document.body.appendChild(iframe);
}

//Get  messages from the child (iframe)
window.addEventListener('message', (e) => {
    console.log('parent received message!:  ', e.data);

    if (e.data.includes && e.data.includes('access_token')) {

        access_token = getParameterByName('access_token', e.data);
        clearInterval(interval);
        DisplayInfo();
    }
});

//Display the info for the first token
(() => DisplayInfo())();