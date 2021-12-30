const sinon = require('sinon');
const { expect } = require('chai');
const { ObjectId } = require('mongodb');
const ProductsModel = require('../../models/ProductsModel');
const ProductsServices = require('../../services/ProductsServices');
const SalesModel = require('../../models/SalesModel');
const SalesServices = require('../../services/SalesServices');

describe('ProductsServices', () => {

  describe('ProductsServices.create()', () => {

    const payloadProduct = { _id: '604cb554311d68f491ba5781', name: 'Teste', quantity: 10 };

    before(() => {
      sinon.stub(ProductsModel, 'create')
        .resolves({ ops: [payloadProduct]});
    });

    after(() => {
      ProductsModel.create.restore();
    });
    
    it('retorna um objeto', async () => {
      const response = await ProductsServices.create(payloadProduct.name, payloadProduct.quantity);
      expect(response).to.be.an('object');
    });

    it('retorna um objeto com propriedades passadas', async () => {
      const response = await ProductsServices.create(payloadProduct.name, payloadProduct.quantity);
      expect(response).to.be.deep.equal(payloadProduct);
    });

    it('retorna erro se produto já existe', async () => {
      sinon.stub(ProductsModel, 'findByQuery')
        .resolves(payloadProduct);
      const errorMessage = { err: { code: "invalid_data", message: "Product already exists" } };
      const response = await ProductsServices.create(payloadProduct.name, payloadProduct.quantity);
      expect(response).to.be.deep.equal(errorMessage);
      ProductsModel.findByQuery.restore();
    });

  });

  describe('ProductsServices.getAll()', () => {

    const payloadProduct = [
      { _id: '604cb554311d68f491ba5781', name: 'Teste 1', quantity: 10 },
      { _id: '604cb554311d68f491ff5901', name: 'Teste 2', quantity: 11 },
    ];

    before(() => {
      sinon.stub(ProductsModel, 'getAll')
        .resolves(payloadProduct);
    });

    after(() => {
      ProductsModel.getAll.restore();
    });
    
    it('retorna um objeto', async () => {
      const response = await ProductsServices.getAll();
      expect(response).to.be.an('object');
    });

    it('retorna um objeto com propriedade products', async () => {
      const response = await ProductsServices.getAll();
      expect(response).to.have.property('products');
    });

    it('propriedade products é um array', async () => {
      const response = await ProductsServices.getAll();
      expect(response.products).to.be.an('array');
    });

    it('propriedade products é um array de tamanho 2', async () => {
      const response = await ProductsServices.getAll();
      expect(response.products).to.have.lengthOf(2);
    });

  });

  describe('ProductsServices.getById()', () => {

    const payloadProduct = { _id: '604cb554311d68f491ba5781', name: 'Teste 1', quantity: 10 };

    before(() => {
      sinon.stub(ProductsModel, 'findByQuery')
      .callsFake(async (id) => {
        if (id === ObjectId(id))
          return Promise.resolve(payloadProduct);
      })
    });

    it('retorna um objeto', async () => {
      const response = await ProductsServices.getById(payloadProduct._id);
      expect(response).to.be.an('object');
    });

    it('retorna o objeto com o id passado', async () => {
      const response = await ProductsServices.getById(payloadProduct._id);
      expect(response).to.be.deep.equal(payloadProduct);
    });

  });

  describe('ProductsServices.remove()', () => {

    const payloadProduct = { _id: '604cb554311d68f491ba5781', name: 'Teste 1', quantity: 10 };

    it('retorna um objeto', async () => {
      const response = await ProductsServices.remove(payloadProduct._id);
      expect(response).to.be.an('object');
    });

    it('retorna o objeto com o id passado', async () => {
      const response = await ProductsServices.remove(payloadProduct._id);
      expect(response).to.be.deep.equal(payloadProduct);
    });

  });

  describe('ProductsServices.update()', () => {

    const payloadProduct = { _id: '604cb554311d68f491ba5781', name: 'Teste 1', quantity: 10 };

    before(() => {
      sinon.stub(ProductsModel, 'update')
      .callsFake(async (id, name, quantity) => {
        return Promise.resolve({ id, name, quantity});
      })
    });

    after(() => {
      ProductsModel.findByQuery.restore();
      ProductsModel.update.restore();
    });
    
    it('retorna um objeto', async () => {
      const response = await ProductsServices.update(
        payloadProduct._id,
        payloadProduct.name,
        payloadProduct.quantity,
      );
      expect(response).to.be.an('object');
    });

    it('retorna o objeto com o id passado', async () => {
      const response = await ProductsServices.update(
        payloadProduct._id,
        payloadProduct.name,
        payloadProduct.quantity,
      );
      expect(response).to.be.deep.equal(payloadProduct);
    });

  });


});

describe('SalesServices', () => {

  describe('SalesServices.create() consegue criar uma venda', () => {

    const payloadSale = {
      _id: '604cb554311d68f491ba5781',
      itensSold: [
        { productId: '604cb554311d68f491ba1342', quantity: 1 },
      ]
    };

    before(() => {
      sinon.stub(SalesModel, 'create')
        .resolves({ ops: [payloadSale]});
      sinon.stub(ProductsServices, 'getById')
        .callsFake(async (id) => {
          if (id === payloadSale.itensSold[0].productId) {
            return Promise.resolve(payloadSale.itensSold[0]);
          }
          return Promise.resolve(null)
        });
      sinon.stub(ProductsModel, 'update')
        .resolves({});
    });

    after(() => {
      SalesModel.create.restore();
      ProductsServices.getById.restore();
      ProductsModel.update.restore();
    });
    
    it('retorna um objeto', async () => {
      const response = await SalesServices.create(payloadSale.itensSold);
      expect(response).to.be.an('object');
    });

    it('retorna um objeto com propriedades passadas', async () => {
      const response = await SalesServices.create(payloadSale.itensSold);
      expect(response).to.be.deep.equal(payloadSale);
    });

  });

  describe('SalesServices.create() não consegue criar uma venda', () => {

    const payloadSale = {
      _id: '604cb554311d68f491ba5781',
      itensSold: [
        { productId: '604cb554311d68f491ba1342', quantity: 1 },
      ]
    };

    before(() => {
      sinon.stub(SalesModel, 'create')
        .resolves({ ops: [payloadSale]});
      sinon.stub(ProductsModel, 'update')
        .resolves({});
    });

    after(() => {
      SalesModel.create.restore();
      ProductsModel.update.restore();
    });
    
    it('retorna erro "product_not_found" se o produto não é encontrado', async () => {
      sinon.stub(ProductsServices, 'getById')
        .resolves(null);
      const errorMessage = {
        err: { code: 'product_not_found', message: 'Product not found' }
      };
      const response = await SalesServices.create(payloadSale.itensSold);
      expect(response).to.be.deep.equal(errorMessage);
      ProductsServices.getById.restore();
    });

    it('retorna erro "stock_problem" se não há quantidade suficiente do produto', async () => {
      sinon.stub(ProductsServices, 'getById')
        .resolves({ ...payloadSale.itensSold[0], quantity: 0 });
      const errorMessage = {
        err: { code: 'stock_problem', message: 'Such amount is not permitted to sell' }
      };
      const response = await SalesServices.create(payloadSale.itensSold);
      expect(response).to.be.deep.equal(errorMessage);
      ProductsServices.getById.restore();
    });

  });

  describe('SalesServices.getAll()', () => {

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

    before(() => {
      sinon.stub(SalesModel, 'getAll')
        .resolves(payloadSales);
    });

    after(() => {
      SalesModel.getAll.restore();
    });
    
    it('retorna um objeto', async () => {
      const response = await SalesServices.getAll();
      expect(response).to.be.an('object');
    });

    it('retorna um objeto com propriedade sales', async () => {
      const response = await SalesServices.getAll();
      expect(response).to.have.property('sales');
    });

    it('propriedade sales é um array', async () => {
      const response = await SalesServices.getAll();
      expect(response.sales).to.be.an('array');
    });

    it('propriedade sales é um array de tamanho 2', async () => {
      const response = await SalesServices.getAll();
      expect(response.sales).to.have.lengthOf(2);
    });

  });

  describe('SalesServices.getById()', () => {

    const payloadSale = {
      _id: '604cb554311d68f491ba5781',
      itensSold: [
        { productId: '604cb554311d68f491ba1342', quantity: 1 },
      ]
    };

    before(() => {
      sinon.stub(SalesModel, 'findByQuery')
      .callsFake(async (id) => {
        if (id === ObjectId(id))
          return Promise.resolve(payloadSale);
      })
    });
    

    it('retorna um objeto', async () => {
      const response = await SalesServices.getById(payloadSale._id);
      expect(response).to.be.an('object');
    });

    it('retorna o objeto com o id passado', async () => {
      const response = await SalesServices.getById(payloadSale._id);
      expect(response).to.be.deep.equal(payloadSale);
    });

  });

  describe('SalesServices.remove()', () => {

    const payloadSale = {
      _id: '604cb554311d68f491ba5781',
      itensSold: [
        { productId: '604cb554311d68f491ba1342', quantity: 1 },
      ]
    };

    before(() => {
      sinon.stub(SalesModel, 'remove')
        .resolves(true);
      sinon.stub(ProductsServices, 'getById')
        .resolves({ _id: '60f130a563a28ed3f2e84857', name: 'Teste', quantity: 10 } );
      sinon.stub(ProductsModel, 'update')
        .resolves(true);
    });

    after(() => {
      SalesModel.remove.restore();
      ProductsServices.getById.restore();
      ProductsModel.update.restore();
    });


    it('retorna um objeto', async () => {
      const response = await SalesServices.remove(payloadSale._id);
      expect(response).to.be.an('object');
    });

    it('retorna o objeto com o id passado', async () => {
      const response = await SalesServices.remove(payloadSale._id);
      expect(response).to.be.deep.equal(payloadSale);
    });

  });

  describe('SalesServices.update()', () => {

    const payloadSale = {
      _id: '604cb554311d68f491ba5781',
      itensSold: [
        { productId: '604cb554311d68f491ba1342', quantity: 1 },
      ]
    };

    before(() => {
      sinon.stub(SalesModel, 'update')
      .callsFake(async (id, name, quantity) => {
        return Promise.resolve({ id, name, quantity});
      })
    });

    after(() => {
      SalesModel.findByQuery.restore();
      SalesModel.update.restore();
    });
    
    it('retorna um objeto', async () => {
      const response = await SalesServices.update(
        payloadSale._id,
        payloadSale.itensSold,
      );
      expect(response).to.be.an('object');
    });

    it('retorna o objeto com o id passado', async () => {
      const response = await SalesServices.update(
        payloadSale._id,
        payloadSale.itensSold,
      );
      expect(response).to.be.deep.equal(payloadSale);
    });

  });

});
