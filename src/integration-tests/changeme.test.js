const chai = require('chai');
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const server = require('../api/app');
const jwtSecret = require('../api/jwtSecret');
const { useCollection } = require('../api/db');

const { ObjectId, MongoClient } = require('mongodb');
const { getConnection } = require('../api/mongoMock');

chai.use(chaiHttp);

const { expect } = chai;

const createNewUser = async (payload) => chai.request(server)
  .post('/users')
  .send(payload);

const login = async (payload) => chai.request(server)
  .post('/login')
  .send(payload);

const createNewRecipe = async (payload, token = '') => chai.request(server)
  .post('/recipes')
  .send(payload)
  .set('Authorization', token);

const getAllRecipes = async (token = '') => chai.request(server)
  .get('/recipes')
  .set('Authorization', token);

const getRecipeById = async (id, token = '') => chai.request(server)
  .get(`/recipes/${id}`)
  .set('Authorization', token);

const updateRecipe = async ({ id, payload, token = '' }) => chai.request(server)
  .put(`/recipes/${id}`)
  .send(payload)
  .set('Authorization', token);

const removeRecipe = async ({ id, token = '' }) => chai.request(server)
  .delete(`/recipes/${id}`)
  .set('Authorization', token);

const userPayload = {
  name: 'Teste da Silva',
  email: 'testing@domain.com',
  password: 'testPassw0rd',
};

const secondUserPayload = {
  name: 'Palmirinha Onofre',
  email: 'palmirinha@badasscook.com',
  password: 'temQueEsquentarBemA...faca',
};

const adminUserPayload = {
  name: 'admin',
  email: 'root@email.com',
  password: 'admin',
  role: 'admin',
};

const recipePayload = {
  name: 'Test recipe',
  ingredients: 'Test ingredients',
  preparation: 'Test preparation',
};

const secondRecipePayload = {
  name: 'Eggplant test',
  ingredients: 'an eggplant and a test library',
  preparation: 'Mock an eggplant and code your tests until coverage reaches 100%',
};

const userInfo = {
  name: userPayload.name,
};

const recipeInfo = {};

describe('POST /users', () => {
  let response;
  
  const invalidEntryStatus = 400;
  const successEntryStatus = 201;
  const invalidEntryMsg = 'Invalid entries. Try again.';

  describe('sem "name" na requisição, usuário não é criado', () => {
    const { email, password } = userPayload;
    
    before(async () => {
      response = await createNewUser({ email, password });
    });

    it(`retorna status ${invalidEntryStatus}`, () => {
      expect(response).to.have.status(invalidEntryStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${invalidEntryMsg}"`, () => {
      expect(response.body.message).to.be.equal(invalidEntryMsg);
    });
  });

  describe('sem "email" na requisição, usuário não é criado', () => {
    const { name, password } = userPayload;

    before(async () => {
      response = await createNewUser({ name, password });
    });

    it(`retorna status ${invalidEntryStatus}`, () => {
      expect(response).to.have.status(invalidEntryStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${invalidEntryMsg}"`, () => {
      expect(response.body.message).to.be.equal(invalidEntryMsg);
    });
  });

  describe('sem "password" na requisição, usuário não é criado', () => {
    const { name, email } = userPayload;
    
    before(async () => {
      response = await createNewUser({ name, email });
    });

    it(`retorna status ${invalidEntryStatus}`, () => {
      expect(response).to.have.status(invalidEntryStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${invalidEntryMsg}"`, () => {
      expect(response.body.message).to.be.equal(invalidEntryMsg);
    });
  });

  describe('usuário normal é criado', () => {
    let connectionMock;
    
    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      response = await createNewUser(userPayload);
      userInfo.id = response.body.user._id
    });

    after(async () => {
      MongoClient.connect.restore();
    });

    it(`retorna status ${successEntryStatus}`, () => {
      expect(response).to.have.status(successEntryStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "user"', () => {
      expect(response.body).to.have.property('user');
    });

    it(`"user" possui as propriedades "name" e "email"`, () => {
      expect(response.body.user).to.have.property('name');
      expect(response.body.user).to.have.property('email');
      expect(response.body.user).not.to.have.property('password');
    });

    it(`as propriedades "name" e "email" possuem os valores enviados`, () => {
      expect(response.body.user.name).to.be.equal(userPayload.name);
      expect(response.body.user.email).to.be.equal(userPayload.email);
    });

    it(`"user" não possui a propriedade "password"`, () => {
      expect(response.body.user).not.to.have.property('password');
    });

    it(`"user" possui propriedade "_id"`, () => {
      expect(response.body.user).to.have.property('_id');
    });

    it(`"user" possui propriedade "_id" no formato do MongoDB`, () => {
      expect(ObjectId.isValid(response.body.user._id)).to.be.equal(true);
    });

    it(`"user" possui propriedade "role"`, () => {
      expect(response.body.user).to.have.property('role');
    });

    it(`propriedade "role" tem valor "user"`, () => {
      expect(response.body.user.role).to.be.equal('user');
    });
  });

});

describe('POST /login', () => {
  let response;
  
  const invalidLoginStatus = 401;
  const missingFiedlsMsg = 'All fields must be filled';
  const invalidLoginMsg = 'Incorrect username or password';
  const successLoginStatus = 200;

  describe('sem "password" na requisição, login não é realizado', () => {
    const { email } = userPayload;
    
    before(async () => {
      response = await login({ email });
    });

    it(`retorna status ${invalidLoginStatus}`, () => {
      expect(response).to.have.status(invalidLoginStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${missingFiedlsMsg}"`, () => {
      expect(response.body.message).to.be.equal(missingFiedlsMsg);
    });
  });

  describe('sem "email" na requisição, login não é realizado', () => {
    const { password } = userPayload;
    
    before(async () => {
      response = await login({ password });
    });

    it(`retorna status ${invalidLoginStatus}`, () => {
      expect(response).to.have.status(invalidLoginStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${missingFiedlsMsg}"`, () => {
      expect(response.body.message).to.be.equal(missingFiedlsMsg);
    });
  });

  describe('com email inválido, login não é realizado', () => {
    let connectionMock;
    
    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);
      const { password } = userPayload;
      response = await login({ email: 'test@', password });
    });

    after(async () => {
      MongoClient.connect.restore();
    });

    it(`retorna status ${invalidLoginStatus}`, () => {
      expect(response).to.have.status(invalidLoginStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${invalidLoginMsg}"`, () => {
      expect(response.body.message).to.be.equal(invalidLoginMsg);
    });
  });

  describe('com email não cadastrado, login não é realizado', () => {
    let connectionMock;
    
    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);
      const { password } = userPayload;
      response = await login({ email: 'test@domain.com', password });
    });

    after(async () => {
      MongoClient.connect.restore();
    });

    it(`retorna status ${invalidLoginStatus}`, () => {
      expect(response).to.have.status(invalidLoginStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${invalidLoginMsg}"`, () => {
      expect(response.body.message).to.be.equal(invalidLoginMsg);
    });
  });

  describe('com senha inválida, login não é realizado', () => {
    let connectionMock;
    
    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);
      const { email } = userPayload;

      response = await login({ email, password: 'wrong password' });
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${invalidLoginStatus}`, () => {
      expect(response).to.have.status(invalidLoginStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${invalidLoginMsg}"`, () => {
      expect(response.body.message).to.be.equal(invalidLoginMsg);
    });
  });

  describe('quando login é realizado, um token válido é retornado', () => {
    let connectionMock;
    let decryptedToken;
    
    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);
      const { email, password } = userPayload;
      response = await login({ email, password });
      decryptedToken = jwt.verify(response.body.token, jwtSecret);
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${successLoginStatus}`, () => {
      expect(response).to.have.status(successLoginStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "token"', () => {
      expect(response.body).to.have.property('token');
    });

    it('"token" é uma string', () => {
      expect(response.body.token).to.be.a('string');
    });

    it('"token" decriptografado tem as propriedades "_id", "email" e "role"', () => {
      expect(decryptedToken).to.have.property('email');
      expect(decryptedToken).to.have.property('_id');
      expect(decryptedToken).to.have.property('role');
    });

    it('"_id", "email" e "role" do token tem os valores corretos', () => {
      expect(decryptedToken.email).to.be.equal(userPayload.email);
      expect(decryptedToken.role).to.be.equal('user');
      expect(ObjectId.isValid(decryptedToken._id)).to.be.equal(true);
    });
  });
});

describe('POST /recipes', () => {
  let response;
  
  const missingTokenStatus = 401;
  const missingTokenMsg = 'missing auth token';
  const invalidTokenStatus = 401;
  const invalidTokenMsg = 'jwt malformed';
  const successStatus = 201;

  describe('não é possível inserir receita sem autenticação', () => {
    
    before(async () => {
      response = await createNewRecipe(recipePayload);
    });

    it(`retorna status ${missingTokenStatus}`, () => {
      expect(response).to.have.status(missingTokenStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${missingTokenMsg}"`, () => {
      expect(response.body.message).to.be.equal(missingTokenMsg);
    });
  });

  describe('não é possível inserir receita com token inválido', () => {
    
    before(async () => {
      response = await createNewRecipe(recipePayload, 'invalidtesttoken');
    });

    it(`retorna status ${invalidTokenStatus}`, () => {
      expect(response).to.have.status(invalidTokenStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${invalidTokenMsg}"`, () => {
      expect(response.body.message).to.be.equal(invalidTokenMsg);
    });
  });

  describe('receita é criada com sucesso', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      const { email, password } = userPayload;
      const { body: { token } } = await login({ email, password });
      response = await createNewRecipe(recipePayload, token);
      recipeInfo.id = response.body.recipe._id;
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${successStatus}`, () => {
      expect(response).to.have.status(successStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "recipe"', () => {
      expect(response.body).to.have.property('recipe');
    });

    it('"recipe" tem propriedades "_id", "name", "ingredients", "preparation" e "userId"', () => {
      expect(response.body.recipe).to.have.keys(
        '_id',
        'name',
        'ingredients',
        'preparation',
        'userId',
      );
    });

    it('"_id", "name", "ingredients", "preparation" e "userId" têm valores corretos', () => {
      const { _id, name, ingredients, preparation, userId } = response.body.recipe;
      expect(ObjectId.isValid(_id)).to.be.true;
      expect(name).to.be.equal(recipePayload.name);
      expect(ingredients).to.be.equal(recipePayload.ingredients);
      expect(preparation).to.be.equal(recipePayload.preparation);
      expect(userId).to.be.equal(userInfo.id);
    });
  });

});

describe('GET /recipes', () => {
  let response;
  
  const successStatus = 200;

  describe('lista de receitas é acessada com token', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      const { email, password } = userPayload;
      const { body: { token } } = await login({ email, password });
      response = await createNewRecipe(secondRecipePayload, token);
      recipeInfo.secondId = response.body.recipe._id;
      response = await getAllRecipes(token);
      recipeInfo.expectedRecipes = [
        {
          ...recipePayload,
          _id: recipeInfo.id,
          userId: userInfo.id,
        },
        {
          ...secondRecipePayload,
          _id: recipeInfo.secondId,
          userId: userInfo.id,
        }
      ];
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${successStatus}`, () => {
      expect(response).to.have.status(successStatus);
    });

    it('retorna um array', () => {
      expect(response.body).to.be.an('array');
    });

    it('retorna um array com duas receitas', () => {
      expect(response.body).to.have.length(2);
    });

    it('retorna um array com as receitas esperadas', () => {
      expect(response.body).to.be.deep.equal(recipeInfo.expectedRecipes);
    });
  });

  describe('lista de receitas é acessada sem token', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      response = await getAllRecipes();
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${successStatus}`, () => {
      expect(response).to.have.status(successStatus);
    });

    it('retorna um array', () => {
      expect(response.body).to.be.an('array');
    });

    it('retorna um array com duas receitas', () => {
      expect(response.body).to.have.length(2);
    });

    it('retorna um array com as receitas esperadas', () => {
      expect(response.body).to.be.deep.equal(recipeInfo.expectedRecipes);
    });
  });
});

describe('GET /recipes/:id', () => {
  let response;
  
  const successStatus = 200;

  describe('receita é acessada com token', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      const { email, password } = userPayload;
      const { body: { token } } = await login({ email, password });
      response = await getRecipeById(recipeInfo.id, token);
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${successStatus}`, () => {
      expect(response).to.have.status(successStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('objeto tem propriedades "_id", "name", "ingredients", "preparation" e "userId"', () => {
      expect(response.body).to.have.keys(
        '_id',
        'name',
        'ingredients',
        'preparation',
        'userId',
      );
    });

    it('"_id", "name", "ingredients", "preparation" e "userId" têm valores corretos', () => {
      const { _id, name, ingredients, preparation, userId } = response.body;
      expect(ObjectId.isValid(_id)).to.be.true;
      expect(name).to.be.equal(recipePayload.name);
      expect(ingredients).to.be.equal(recipePayload.ingredients);
      expect(preparation).to.be.equal(recipePayload.preparation);
      expect(userId).to.be.equal(userInfo.id);
    });
  });

  describe('receita é acessada sem token', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      response = await getRecipeById(recipeInfo.id);
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${successStatus}`, () => {
      expect(response).to.have.status(successStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('objeto tem propriedades "_id", "name", "ingredients", "preparation" e "userId"', () => {
      expect(response.body).to.have.keys(
        '_id',
        'name',
        'ingredients',
        'preparation',
        'userId',
      );
    });

    it('"_id", "name", "ingredients", "preparation" e "userId" têm valores corretos', () => {
      const { _id, name, ingredients, preparation, userId } = response.body;
      expect(ObjectId.isValid(_id)).to.be.true;
      expect(name).to.be.equal(recipePayload.name);
      expect(ingredients).to.be.equal(recipePayload.ingredients);
      expect(preparation).to.be.equal(recipePayload.preparation);
      expect(userId).to.be.equal(userInfo.id);
    });
  });
});

describe('PUT /recipes/:id', () => {
  let response;

  const missingTokenStatus = 401;
  const missingTokenMsg = 'missing auth token';
  const invalidTokenStatus = 401;
  const invalidTokenMsg = 'jwt malformed';
  const successStatus = 200;

  describe('receita não é editada sem token', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      response = await updateRecipe({
        id: recipeInfo.id,
        payload: secondRecipePayload,
        token: '',
      });
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${missingTokenStatus}`, () => {
      expect(response).to.have.status(missingTokenStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${missingTokenMsg}"`, () => {
      expect(response.body.message).to.be.equal(missingTokenMsg);
    });
  });

  describe('receita não é editada com token inválido', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      response = await updateRecipe({
        id: recipeInfo.id,
        payload: secondRecipePayload,
        token: 'ThIsIs4nInv4lidt0ken',
      });
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${invalidTokenStatus}`, () => {
      expect(response).to.have.status(invalidTokenStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${invalidTokenMsg}"`, () => {
      expect(response.body.message).to.be.equal(invalidTokenMsg);
    });
  });

  describe('receita não é editada por outro usuário comum', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      await createNewUser(secondUserPayload);
      const { email, password } = secondUserPayload;
      const { body: { token } } = await login({ email, password });

      response = await updateRecipe({
        id: recipeInfo.id,
        payload: secondRecipePayload,
        token: token,
      });
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${successStatus}`, () => {
      expect(response).to.have.status(successStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('objeto tem propriedades "_id", "name", "ingredients", "preparation" e "userId"', () => {
      expect(response.body).to.have.keys(
        '_id',
        'name',
        'ingredients',
        'preparation',
        'userId',
      );
    });

    it('"_id", "name", "ingredients", "preparation" e "userId" têm valores corretos', () => {
      const { _id, name, ingredients, preparation, userId } = response.body;
      expect(ObjectId.isValid(_id)).to.be.true;
      expect(name).to.be.equal(recipePayload.name);
      expect(ingredients).to.be.equal(recipePayload.ingredients);
      expect(preparation).to.be.equal(recipePayload.preparation);
      expect(userId).to.be.equal(userInfo.id);
    });
  });

  describe('receita é editada por usuário que a criou', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      const { email, password } = userPayload;
      const { body: { token } } = await login({ email, password });

      response = await updateRecipe({
        id: recipeInfo.id,
        payload: secondRecipePayload,
        token: token,
      });
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${successStatus}`, () => {
      expect(response).to.have.status(successStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('objeto tem propriedades "_id", "name", "ingredients", "preparation" e "userId"', () => {
      expect(response.body).to.have.keys(
        '_id',
        'name',
        'ingredients',
        'preparation',
        'userId',
      );
    });

    it('"_id", "name", "ingredients", "preparation" e "userId" têm valores corretos', () => {
      const { _id, name, ingredients, preparation, userId } = response.body;
      expect(ObjectId.isValid(_id)).to.be.true;
      expect(name).to.be.equal(secondRecipePayload.name);
      expect(ingredients).to.be.equal(secondRecipePayload.ingredients);
      expect(preparation).to.be.equal(secondRecipePayload.preparation);
      expect(userId).to.be.equal(userInfo.id);
    });
  });

  describe('receita é editada por usuário admin', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      useCollection('users')
        .then((coll) => coll.insertOne(adminUserPayload));

      const { email, password } = adminUserPayload;
      const { body: { token } } = await login({ email, password });

      response = await updateRecipe({
        id: recipeInfo.id,
        payload: recipePayload,
        token: token,
      });
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${successStatus}`, () => {
      expect(response).to.have.status(successStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('objeto tem propriedades "_id", "name", "ingredients", "preparation" e "userId"', () => {
      expect(response.body).to.have.keys(
        '_id',
        'name',
        'ingredients',
        'preparation',
        'userId',
      );
    });

    it('"_id", "name", "ingredients", "preparation" e "userId" têm valores corretos', () => {
      const { _id, name, ingredients, preparation, userId } = response.body;
      expect(ObjectId.isValid(_id)).to.be.true;
      expect(name).to.be.equal(recipePayload.name);
      expect(ingredients).to.be.equal(recipePayload.ingredients);
      expect(preparation).to.be.equal(recipePayload.preparation);
      expect(userId).to.be.equal(userInfo.id);
    });
  });
});

// /*
describe('DELETE /recipes/:id', () => {
  let response;

  const missingTokenStatus = 401;
  const missingTokenMsg = 'missing auth token';
  const invalidTokenStatus = 401;
  const invalidTokenMsg = 'jwt malformed';
  const forbiddenStatus = 403;
  const successStatus = 204;

  describe('receita não é removida sem token', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      response = await removeRecipe({
        id: recipeInfo.id,
        token: '',
      });
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${missingTokenStatus}`, () => {
      expect(response).to.have.status(missingTokenStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${missingTokenMsg}"`, () => {
      expect(response.body.message).to.be.equal(missingTokenMsg);
    });
  });

  describe('receita não é removida com token inválido', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      response = await removeRecipe({
        id: recipeInfo.id,
        token: 'ThIsIs4nInv4lidt0ken',
      });
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${invalidTokenStatus}`, () => {
      expect(response).to.have.status(invalidTokenStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('retorna um objeto com propriedade "message"', () => {
      expect(response.body).to.have.property('message');
    });

    it(`"message" possui texto "${invalidTokenMsg}"`, () => {
      expect(response.body.message).to.be.equal(invalidTokenMsg);
    });
  });

  describe('receita não é removida por outro usuário comum', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      await createNewUser(secondUserPayload);
      const { email, password } = secondUserPayload;
      const { body: { token } } = await login({ email, password });

      response = await removeRecipe({
        id: recipeInfo.id,
        token,
      });
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${forbiddenStatus}`, () => {
      expect(response).to.have.status(forbiddenStatus);
    });

    it('retorna um objeto', () => {
      expect(response.body).to.be.an('object');
    });

    it('objeto tem propriedades "_id", "name", "ingredients", "preparation" e "userId"', () => {
      expect(response.body).to.have.keys(
        '_id',
        'name',
        'ingredients',
        'preparation',
        'userId',
      );
    });

    it('"_id", "name", "ingredients", "preparation" e "userId" têm valores corretos', () => {
      const { _id, name, ingredients, preparation, userId } = response.body;
      expect(ObjectId.isValid(_id)).to.be.true;
      expect(name).to.be.equal(recipePayload.name);
      expect(ingredients).to.be.equal(recipePayload.ingredients);
      expect(preparation).to.be.equal(recipePayload.preparation);
      expect(userId).to.be.equal(userInfo.id);
    });
  });

  describe('receita é removida por usuário que a criou', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      const { email, password } = userPayload;
      const { body: { token } } = await login({ email, password });

      response = await removeRecipe({
        id: recipeInfo.id,
        token,
      });
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${successStatus}`, () => {
      expect(response).to.have.status(successStatus);
    });

    it('retorna resposta vazia', () => {
      expect(response.body).to.be.empty;
    });
  });

  describe('receita é removida por usuário admin', () => {

    before(async () => {
      connectionMock = await getConnection();
      sinon.stub(MongoClient, 'connect').resolves(connectionMock);

      const { email, password } = adminUserPayload;
      const { body: { token } } = await login({ email, password });

      response = await removeRecipe({
        id: recipeInfo.secondId,
        token,
      });
    });

    after(async () => {
      MongoClient.connect.restore();
    });
    
    it(`retorna status ${successStatus}`, () => {
      expect(response).to.have.status(successStatus);
    });

    it('retorna resposta vazia', () => {
      expect(response.body).to.be.empty;
    });
  });
});
// */