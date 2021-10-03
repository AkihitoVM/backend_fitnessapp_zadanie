import {
    Sequelize,
    DataTypes,
    Model
} from 'sequelize'

import { DatabaseModel } from '../types/db'

import { ROLE } from '../utils/enums'


export class UserModel extends DatabaseModel {
    id: number
    name: string
    surname: string
    password: string
    nickName: string
    email: string
    age: number
    role: ROLE
}

export default (sequelize: Sequelize) => {
    UserModel.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate:{
                notEmpty:true
            }
        },
        surname: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate:{
                notEmpty:true
            }
        },
        password: {
            type: DataTypes.STRING(200),
        },
        nickName: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate:{
                notEmpty:true
            }
        },
        email: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                isEmail: true,
                notEmpty: true,
            }
        },
        age: {
            type: DataTypes.INTEGER
        },
        role: {
            type: DataTypes.ENUM(...Object.values(ROLE))
        }
    }, {
        timestamps: true,
        sequelize,
        modelName: 'user'
    })
    return UserModel
}
