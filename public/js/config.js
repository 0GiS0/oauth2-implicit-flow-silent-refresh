var config = {
    tenantId: '<YOUR TENANT ID>',
    response_type: 'token',
    client_id: '<YOUR CLIENT ID>',
    redirect_uri: 'http://localhost:8000/give/me/the/access/token',
    scope: 'https://graph.microsoft.com/User.Read',
    resource: 'https://graph.microsoft.com/',
    state: 'a-random-value-for-state'
};