import {
  DataTypes,
  HasOneGetAssociationMixin,
  ForeignKey,
  Model,
  CreationOptional,
} from 'sequelize';
import sequelize from '../index';

class User extends Model {
  declare id: CreationOptional<number>;
  declare username: string;
  declare pfp: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare getOauth: HasOneGetAssociationMixin<Oauth>;
  declare getLocal: HasOneGetAssociationMixin<Local>;
}

User.init(
  {
    username: DataTypes.STRING,
    pfp: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: 'user',
  }
);

class Oauth extends Model {
  declare user_id: ForeignKey<User['id']>;
  declare id: string;
  declare provider: string;
  declare accessToken: string;
  declare refreshToken: string;
}

Oauth.init(
  {
    provider: DataTypes.STRING,
    id: {
      primaryKey: true,
      type: DataTypes.STRING,
    },
    accessToken: DataTypes.STRING,
    refreshToken: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: 'oauth',
  }
);

class Local extends Model {
  declare user_id: ForeignKey<User['id']>;
  declare encryptedPassword: string;
  declare email: string;
  declare email_verified: boolean;
}

Local.init(
  {
    encrypted_password: DataTypes.STRING,
    email: DataTypes.STRING,
    email_verified: DataTypes.BOOLEAN,
  },
  {
    sequelize,
    modelName: 'local',
  }
);

User.hasOne(Oauth);
User.hasOne(Local);

Oauth.belongsTo(User);
Local.belongsTo(User);

export { User, Oauth, Local };
