const sinon = require('sinon');
const { expect } = require('chai');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const ProductsModel = require('../../models/ProductsModel');
const SalesModel = require('../../models/SalesModel');

describe('Testando models', () => {
  before(async () => {
    const DBServer = await MongoMemoryServer.create();
    const URLMock = await DBServer.getUri();
    const mongoConfig = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    const connectionMock = await MongoClient
      .connect(URLMock, mongoConfig);

    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    MongoClient.connect.restore();
  });

  const createdProducts = [];
  
  describe('Products model', () => {

    const products = Array.from({ length: 10 }, (_, index) => [`Produto teste ${index}`, index + 10]);

    describe('ProductsModel.create() insere um novo produto no banco de dados', () => {

      it('resposta existe', async () => {
        const { ops: [newProduct] } = await ProductsModel.create(...products[0]);
        expect(newProduct).not.to.be.undefined;
        createdProducts.push(newProduct);
      });

      it('retorna um objeto', async () => {
        const { ops: [newProduct] } = await ProductsModel.create(...products[1]);
        expect(newProduct).to.be.an('object');
        createdProducts.push(newProduct);
      });

      it('objeto tem propriedades "_id", "name" e "quantity"', async () => {
        const { ops: [newProduct] } = await ProductsModel.create(...products[2]);
        expect(newProduct).to.have.all.keys('_id', 'name', 'quantity');
        createdProducts.push(newProduct);
      });

      it('propriedades "name" e "quantity" têm os valores passados', async () => {
        const insertedSize = createdProducts.length;
        products.slice(insertedSize).forEach(async (product) => {
          const { ops: [newProduct] } = await ProductsModel.create(...product);
          expect(newProduct.name).to.be.equal(product[0]);
          expect(newProduct.quantity).to.be.equal(product[1]);
          createdProducts.push(newProduct);
        });
      });
    });

    describe('ProductsModel.getAll() retorna todos produtos cadastrados', () => {
      it('retorna um array', async () => {
        const response = await ProductsModel.getAll();
        expect(response).to.be.an('array');
      });
      it('array tem a mesma quantidade de itens inseridos', async () => {
        const response = await ProductsModel.getAll();
        expect(response).to.have.lengthOf(createdProducts.length);
      });
      it('array possui todos os itens inseridos', async () => {
        const response = await ProductsModel.getAll();
        expect(response).to.be.deep.equal(createdProducts);
      });
    });

    describe('ProductsModel.findByQuery() retorna produtos por id', () => {
      it('retorna null quando passado id inválido', async () => {
        const response = await ProductsModel.findByQuery({ _id: 1 });
        expect(response).to.be.null;
      });
      it('retorna um objeto quando passado um id existente', async () => {
        const response = await ProductsModel.findByQuery({ _id: createdProducts[0]._id });
        expect(response).to.be.an('object');
      });
      it('retorna o objeto certo para cada id existente que é passado', async () => {
        createdProducts.forEach(async (product) => {
          const response = await ProductsModel.findByQuery(ObjectId(product._id));
          expect(response).to.be.deep.equal(product);
        });
      });
    });

    describe('ProductsModel.update() atualiza produtos', () => {
      it('não atualiza nenhum quando passado id inválido', async () => {
        const response = await ProductsModel.update(1, 'Produto atualizado', 9);
        expect(response.modifiedCount).to.be.equal(0);
      });
      it('atualiza um quando passado id válido', async () => {
        const [id, newName, newQuantity] = [createdProducts[0]._id, 'Produto atualizado', 9];
        const response = await ProductsModel.update(id, newName, newQuantity);
        expect(response.modifiedCount).to.be.equal(1);
      });
      it('altera produtos com as novas informações passadas', async () => {
        const getNewName = (index) => `Produto atualizado ${index}`;
        const getNewQtty = (qtty, index) => qtty - index;
        createdProducts.forEach(async (product, index) => {
          await ProductsModel.update(
            product._id,
            getNewName(index),
            getNewQtty(product.quantity, index),
          );
        });
        createdProducts.forEach(async (product, index) => {
          const response = await ProductsModel.findByQuery(ObjectId(product._id));
          expect(response).to.be.deep.equal({
            _id: product._id,
            name: getNewName(index),
            quantity: getNewQtty(product.quantity, index),
          });
        });
      });
      it('atualiza produtos com as informações iniciais', async () => {
        createdProducts.forEach(async (product) => {
          await ProductsModel.update(product._id, product.name, product.quantity);
        });
        createdProducts.forEach(async (product) => {
          const response = await ProductsModel.findByQuery(ObjectId(product._id));
          expect(response).to.be.deep.equal(product);
        });
      });
    });

    describe('ProductsModel.remove() remove produtos', () => {
      it('remove apenas um produto', async () => {
        const productToRemove = createdProducts.pop();
        const response = await ProductsModel.remove(productToRemove._id);
        expect(response.deletedCount).to.be.equal(1);
      });
      it('produto removido não está mais entre os produtos do DB', async () => {
        const productToRemove = createdProducts.pop();
        await ProductsModel.remove(productToRemove._id);
        const response = await ProductsModel.getAll();
        expect(response).to.not.have.members([productToRemove]);
      });
    });

  });

  describe('Sales model', () => {

    const createdSales = [];
    const getNumOfProducts = (num) => {
      return Array.from({ length: num }, (_, index) => {
        const productIndex = Math.floor((Math.random() * createdProducts.length) + 1);
        return { ...createdProducts[productIndex], quantity: index + 1 }
      });
    };

    describe('SalesModel.create() insere um novo produto no banco de dados', () => {

      it('resposta existe', async () => {
        const sale = getNumOfProducts(2);
        const { ops: [newSale] } = await SalesModel.create(sale);
        expect(newSale).not.to.be.undefined;
        createdSales.push(newSale);
      });

      it('retorna um objeto', async () => {
        const sale = getNumOfProducts(3);
        const { ops: [newSale] } = await SalesModel.create(sale);
        expect(newSale).to.be.an('object');
        createdSales.push(newSale);
      });

      it('objeto tem propriedades "_id" e "itensSold"', async () => {
        const sale = getNumOfProducts(3);
        const { ops: [newSale] } = await SalesModel.create(sale);
        expect(newSale).to.have.all.keys('_id', 'itensSold');
        createdSales.push(newSale);
      });

      it('propriedade "itensSold" é um array', async () => {
        const sale = getNumOfProducts(3);
        const { ops: [newSale] } = await SalesModel.create(sale);
        expect(newSale.itensSold).to.be.an('array');
        createdSales.push(newSale);
      });

      it('"itensSold" é um array de produtos igual ao inserido', async () => {
        const sale = getNumOfProducts(2);
        const { ops: [newSale] } = await SalesModel.create(sale);
        expect(newSale.itensSold).to.be.deep.equal(sale);
        createdSales.push(newSale);
      });
    });

    describe('SalesModel.getAll() retorna todas vendas cadastradas', () => {
      it('retorna um array', async () => {
        const response = await SalesModel.getAll();
        expect(response).to.be.an('array');
      });
      it('array tem a mesma quantidade de itens inseridos', async () => {
        const response = await SalesModel.getAll();
        expect(response).to.have.lengthOf(createdSales.length);
      });
      it('array possui todos os itens inseridos', async () => {
        const response = await SalesModel.getAll();
        expect(response).to.be.deep.equal(createdSales);
      });
    });

    describe('SalesModel.findByQuery() retorna vendas por id', () => {
      it('retorna null quando passado id inválido', async () => {
        const response = await SalesModel.findByQuery({ _id: 1 });
        expect(response).to.be.null;
      });
      it('retorna um objeto quando passado um id existente', async () => {
        const response = await SalesModel.findByQuery({ _id: createdSales[0]._id });
        expect(response).to.be.an('object');
      });
      it('retorna o objeto certo para cada id existente que é passado', async () => {
        createdSales.forEach(async (product) => {
          const response = await SalesModel.findByQuery(ObjectId(product._id));
          expect(response).to.be.deep.equal(product);
        });
      });
    });

    describe('SalesModel.update() atualiza vendas', () => {
      it('não atualiza nenhuma quando passado id inválido', async () => {
        const response = await SalesModel.update(1, [{}]);
        expect(response.modifiedCount).to.be.equal(0);
      });
      it('atualiza uma quando passado id válido', async () => {
        const [id, newProducts] = [createdSales[0]._id, createdSales[1].itensSold];
        const response = await SalesModel.update(id, newProducts);
        expect(response.modifiedCount).to.be.equal(1);
      });
      it('altera produtos com as novas informações passadas', async () => {
        const newItensSold = [];
        createdSales.forEach(async (sale, index) => {
          const itensSold = getNumOfProducts(index + 1);
          await SalesModel.update(
            sale._id,
            itensSold,
          );
          newItensSold.push(itensSold);
        });
        createdSales.forEach(async (sale, index) => {
          const response = await SalesModel.findByQuery(ObjectId(sale._id));
          expect(response).to.be.deep.equal({
            _id: sale._id,
            itensSold: newItensSold[index],
          });
        });
      });
    });

    describe('SalesModel.remove() remove produtos', () => {
      it('remove apenas uma venda', async () => {
        const saleToRemove = createdSales.pop();
        const response = await SalesModel.remove(saleToRemove._id);
        expect(response.deletedCount).to.be.equal(1);
      });
      it('venda removida não está mais entre as vendas do DB', async () => {
        const saleToRemove = createdSales.pop();
        await SalesModel.remove(saleToRemove._id);
        const response = await SalesModel.getAll();
        expect(response).to.not.have.members([saleToRemove]);
      });
    });

  });

});
