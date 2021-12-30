const sinon = require('sinon');
const { expect } = require('chai');
const ProductsController = require('../../controllers/ProductsController');
const ProductsServices = require('../../services/ProductsServices');
const SalesController = require('../../controllers/SalesController');
const SalesServices = require('../../services/SalesServices');
const errorObject = require('../../utils/errorObject');

describe('ProductsController', () => {

  describe('ProductsController.create() ', () => {

    const productPayload = {
      ops: [{ _id: '604cb554311d68f491ba5781', name: 'Teste', quantity: 10 }]
    };

    const response = {};
    const request = {};
    const next = sinon.stub()
      .callsFake((arg) => arg);

    before(() => {
      request.body = {
        name: 'Teste',
        quantity: 10,
      };

      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();
    });
    
    it('Chama next com erro ao retornar objeto de erro', async () => {
      sinon.stub(ProductsServices, 'create')
        .resolves(errorObject('invalid_data', 'Product already exists'));
      await ProductsController.create(request, response, next);
      expect(next
        .calledWith(errorObject('invalid_data', 'Product already exists')))
        .to.be.equal(true);
      ProductsServices.create.restore();
    });

    it('Retorna status 201 quando objeto é retornado', async () => {
      sinon.stub(ProductsServices, 'create')
        .resolves(productPayload);
      await ProductsController.create(request, response, next);
      expect(response.status.calledWith(201)).to.be.equal(true);
    });

    it('Retorna json com objeto', async () => {
      await ProductsController.create(request, response, next);
      expect(response.json.calledWith(productPayload)).to.be.equal(true);
      ProductsServices.create.restore();
    });

  });

  describe('ProductsController.getAll() ', () => {

    const allProducts = [
      { _id: '604cb554311d68f491ba5781', name: 'Teste 1', quantity: 10 },
      { _id: '604cb554311d68f491ff5901', name: 'Teste 2', quantity: 11 },
    ];

    const response = {};
    const request = {};

    before(() => {
      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();
      sinon.stub(ProductsServices, 'getAll')
        .resolves(allProducts);
    });

    after(() => {
      ProductsServices.getAll.restore();
    });

    it('Retorna status 200', async () => {
      await ProductsController.getAll(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('Retorna json com array de produtos', async () => {
      await ProductsController.getAll(request, response);
      expect(response.json.calledWith(allProducts)).to.be.equal(true);
    });

  });

  describe('ProductsController.getById() ', () => {

    const productPayload = { _id: '604cb554311d68f491ba5781', name: 'Teste', quantity: 10 };

    const response = {};
    const request = {};

    before(() => {
      request.params = '604cb554311d68f491ba5781';
      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();
      sinon.stub(ProductsServices, 'getById')
        .resolves(productPayload);
    });

    after(() => {
      ProductsServices.getById.restore();
    });
    
    it('Retorna status 200', async () => {
      await ProductsController.getById(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('Retorna json com objeto', async () => {
      await ProductsController.getById(request, response);
      expect(response.json.calledWith(productPayload)).to.be.equal(true);
    });

  });

  describe('ProductsController.remove() ', () => {

    const productPayload = { _id: '604cb554311d68f491ba5781', name: 'Teste', quantity: 10 };

    const response = {};
    const request = {};

    before(() => {
      request.params = '604cb554311d68f491ba5781';
      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();
      sinon.stub(ProductsServices, 'remove')
        .resolves(productPayload);
    });

    after(() => {
      ProductsServices.remove.restore();
    });
    
    it('Retorna status 200', async () => {
      await ProductsController.remove(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('Retorna json com objeto', async () => {
      await ProductsController.remove(request, response);
      expect(response.json.calledWith(productPayload)).to.be.equal(true);
    });

  });

  describe('ProductsController.update() ', () => {

    const productPayload = { _id: '604cb554311d68f491ba5781', name: 'Teste', quantity: 10 };

    const response = {};
    const request = {};

    before(() => {
      request.params = '604cb554311d68f491ba5781';
      request.body = {
        name: 'Teste',
        quantity: 10,
      };
      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();
      sinon.stub(ProductsServices, 'update')
        .resolves(productPayload);
    });

    after(() => {
      ProductsServices.update.restore();
    });
    
    it('Retorna status 200', async () => {
      await ProductsController.update(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('Retorna json com objeto', async () => {
      await ProductsController.update(request, response);
      expect(response.json.calledWith(productPayload)).to.be.equal(true);
    });

  });

});

describe('SalesController', () => {

  describe('SalesController.create() ', () => {

    const payloadSale = {
      _id: '604cb554311d68f491ba5781',
      itensSold: [
        { productId: '604cb554311d68f491ba1342', quantity: 1 },
      ]
    };

    const response = {};
    const request = {};
    const next = sinon.stub()
      .callsFake((arg) => arg);

    before(() => {
      request.body = payloadSale.itensSold;

      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();
    });
    
    it('Chama next com erro ao retornar objeto de erro', async () => {
      sinon.stub(SalesServices, 'create')
        .resolves(errorObject('invalid_data', 'Wrong product ID or invalid quantity'));
      await SalesController.create(request, response, next);
      expect(next
        .calledWith(errorObject('invalid_data', 'Wrong product ID or invalid quantity')))
        .to.be.equal(true);
      SalesServices.create.restore();
    });

    it('Retorna status 200 quando objeto é retornado', async () => {
      sinon.stub(SalesServices, 'create')
        .resolves(payloadSale);
      await SalesController.create(request, response, next);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('Retorna json com objeto', async () => {
      await SalesController.create(request, response, next);
      expect(response.json.calledWith(payloadSale)).to.be.equal(true);
      SalesServices.create.restore();
    });

  });

  describe('SalesController.getAll() ', () => {

    const payloadSales = [
      {
        _id: '60f12da2631100c266486ec3',
        itensSold: [
          { productId: '60f12dac0a10888e4ef7d84a', quantity: 1 },
        ]
      },
      {
        _id: '60f12db564d020cfb719ddbb',
        itensSold: [
          { productId: '60f12dbcd1a4f5a9d4fa5aa3', quantity: 2 },
        ]
      },
    ];

    const response = {};
    const request = {};

    before(() => {
      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();
      sinon.stub(SalesServices, 'getAll')
        .resolves(payloadSales);
    });

    after(() => {
      SalesServices.getAll.restore();
    });

    it('Retorna status 200', async () => {
      await SalesController.getAll(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('Retorna json com array de produtos', async () => {
      await SalesController.getAll(request, response);
      expect(response.json.calledWith(payloadSales)).to.be.equal(true);
    });

  });

  describe('SalesController.getById() ', () => {

    const payloadSale = {
      _id: '604cb554311d68f491ba5781',
      itensSold: [
        { productId: '604cb554311d68f491ba1342', quantity: 1 },
      ]
    };

    const response = {};
    const request = {};
    const next = sinon.stub()
      .callsFake((arg) => arg);


    before(() => {
      request.params = '604cb554311d68f491ba5781';
      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();
    });

    after(() => {
      SalesServices.getById.restore();
    });

    it('Chama next com erro ao não retornar resultado', async () => {
      sinon.stub(SalesServices, 'getById')
        .resolves(null);
      await SalesController.getById(request, response, next);
      expect(next
        .calledWith(errorObject('not_found', 'Sale not found')))
        .to.be.equal(true);
      SalesServices.getById.restore();
    });

    
    it('Retorna status 200', async () => {
      sinon.stub(SalesServices, 'getById')
        .resolves(payloadSale);
      await SalesController.getById(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('Retorna json com objeto', async () => {
      await SalesController.getById(request, response);
      expect(response.json.calledWith(payloadSale)).to.be.equal(true);
    });

  });

  describe('SalesController.remove() ', () => {

    const payloadSale = {
      _id: '604cb554311d68f491ba5781',
      itensSold: [
        { productId: '604cb554311d68f491ba1342', quantity: 1 },
      ]
    };

    const response = {};
    const request = {};

    before(() => {
      request.params = '604cb554311d68f491ba5781';
      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();
      sinon.stub(SalesServices, 'remove')
        .resolves(payloadSale);
    });

    after(() => {
      SalesServices.remove.restore();
    });
    
    it('Retorna status 200', async () => {
      await SalesController.remove(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('Retorna json com objeto', async () => {
      await SalesController.remove(request, response);
      expect(response.json.calledWith(payloadSale)).to.be.equal(true);
    });

  });

  describe('SalesController.update() ', () => {

    const payloadSale = {
      _id: '604cb554311d68f491ba5781',
      itensSold: [
        { productId: '604cb554311d68f491ba1342', quantity: 1 },
      ]
    };

    const response = {};
    const request = {};

    before(() => {
      request.params = '604cb554311d68f491ba5781';
      request.body = payloadSale.itensSold;
      response.status = sinon.stub()
        .returns(response);
      response.json = sinon.stub()
        .returns();
      sinon.stub(SalesServices, 'update')
        .resolves(payloadSale);
    });

    after(() => {
      SalesServices.update.restore();
    });
    
    it('Retorna status 200', async () => {
      await SalesController.update(request, response);
      expect(response.status.calledWith(200)).to.be.equal(true);
    });

    it('Retorna json com objeto', async () => {
      await SalesController.update(request, response);
      expect(response.json.calledWith(payloadSale)).to.be.equal(true);
    });

  });

});
