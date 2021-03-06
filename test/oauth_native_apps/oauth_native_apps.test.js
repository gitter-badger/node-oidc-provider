'use strict';

const bootstrap = require('../test_helper');
const { expect } = require('chai');

const fail = () => {
  throw new Error('expected promise to be rejected');
};

describe('OAuth 2.0 for Native Apps Best Current Practice features', function () {
  before(bootstrap(__dirname)); // provider

  describe('changed native client validations', function () {
    describe('App-declared Custom URI Scheme Redirection', function () {
      it('allows custom uri scheme uris with localhost', function () {
        return i(this.provider).clientAdd({
          application_type: 'native',
          client_id: 'native-custom',
          grant_types: ['implicit'],
          response_types: ['id_token'],
          token_endpoint_auth_method: 'none',
          redirect_uris: ['com.example.app://localhost/op/callback', 'com.example.app:/op/callback'],
        });
      });

      it('rejects custom schemes without dots with reverse domain name scheme recommendation', function () {
        return i(this.provider).clientAdd({
          application_type: 'native',
          client_id: 'native-custom',
          grant_types: ['implicit'],
          response_types: ['id_token'],
          token_endpoint_auth_method: 'none',
          redirect_uris: ['myapp:/op/callback'],
        }).then(fail, (err) => {
          expect(err).to.have.property('message', 'invalid_redirect_uri');
          expect(err).to.have.property('error_description', 'redirect_uris for native clients using Custom URI scheme should use reverse domain name based scheme');
        });
      });
    });

    describe('App-claimed HTTPS URI Redirection', function () {
      it('allows claimed https uris', function () {
        return i(this.provider).clientAdd({
          application_type: 'native',
          client_id: 'native-custom',
          grant_types: ['implicit'],
          response_types: ['id_token'],
          token_endpoint_auth_method: 'none',
          redirect_uris: ['https://claimed.example.com/op/callback'],
        });
      });

      it('rejects https if using loopback uris', function () {
        return i(this.provider).clientAdd({
          application_type: 'native',
          client_id: 'native-custom',
          grant_types: ['implicit'],
          response_types: ['id_token'],
          token_endpoint_auth_method: 'none',
          redirect_uris: ['https://localhost/op/callback'],
        }).then(fail, (err) => {
          expect(err).to.have.property('message', 'invalid_redirect_uri');
          expect(err).to.have.property('error_description', 'redirect_uris for native clients using claimed HTTPS URIs must not be using localhost as hostname');
        });
      });
    });

    describe('Loopback URI Redirection', function () {
      it('allows http protocol localhost loopback uris', function () {
        return i(this.provider).clientAdd({
          application_type: 'native',
          client_id: 'native-custom',
          grant_types: ['implicit'],
          response_types: ['id_token'],
          token_endpoint_auth_method: 'none',
          redirect_uris: ['http://localhost:2355/op/callback'],
        }).then((client) => {
          expect(client.redirectUris).to.contain('http://localhost/op/callback');
          expect(client.redirectUriAllowed('http://localhost/op/callback')).to.be.true;
          expect(client.redirectUriAllowed('http://localhost:80/op/callback')).to.be.true;
          expect(client.redirectUriAllowed('http://localhost:443/op/callback')).to.be.true;
          expect(client.redirectUriAllowed('http://localhost:2355/op/callback')).to.be.true;
          expect(client.redirectUriAllowed('http://localhost:8888/op/callback')).to.be.true;
        });
      });

      it('allows http protocol IPv4 loopback uris', function () {
        return i(this.provider).clientAdd({
          application_type: 'native',
          client_id: 'native-custom',
          grant_types: ['implicit'],
          response_types: ['id_token'],
          token_endpoint_auth_method: 'none',
          redirect_uris: ['http://127.0.0.1:2355/op/callback'],
        }).then((client) => {
          expect(client.redirectUris).to.contain('http://127.0.0.1/op/callback');
          expect(client.redirectUriAllowed('http://127.0.0.1/op/callback')).to.be.true;
          expect(client.redirectUriAllowed('http://127.0.0.1:80/op/callback')).to.be.true;
          expect(client.redirectUriAllowed('http://127.0.0.1:443/op/callback')).to.be.true;
          expect(client.redirectUriAllowed('http://127.0.0.1:2355/op/callback')).to.be.true;
          expect(client.redirectUriAllowed('http://127.0.0.1:8888/op/callback')).to.be.true;
        });
      });

      it('allows http protocol IPv6 loopback uris', function () {
        return i(this.provider).clientAdd({
          application_type: 'native',
          client_id: 'native-custom',
          grant_types: ['implicit'],
          response_types: ['id_token'],
          token_endpoint_auth_method: 'none',
          redirect_uris: ['http://[::1]:2355/op/callback'],
        }).then((client) => {
          expect(client.redirectUris).to.contain('http://[::1]/op/callback');
          expect(client.redirectUriAllowed('http://[::1]/op/callback')).to.be.true;
          expect(client.redirectUriAllowed('http://[::1]:80/op/callback')).to.be.true;
          expect(client.redirectUriAllowed('http://[::1]:443/op/callback')).to.be.true;
          expect(client.redirectUriAllowed('http://[::1]:2355/op/callback')).to.be.true;
          expect(client.redirectUriAllowed('http://[::1]:8888/op/callback')).to.be.true;
        });
      });

      it('rejects http protocol uris not using loopback uris', function () {
        return i(this.provider).clientAdd({
          application_type: 'native',
          client_id: 'native-custom',
          grant_types: ['implicit'],
          response_types: ['id_token'],
          token_endpoint_auth_method: 'none',
          redirect_uris: ['http://rp.example.com/op/callback'],
        }).then(fail, (err) => {
          expect(err).to.have.property('message', 'invalid_redirect_uri');
          expect(err).to.have.property('error_description', 'redirect_uris for native clients using http as a protocol can only use loopback addresses as hostnames');
        });
      });
    });
  });
});
