'use strict'

const Service = require('egg').Service
const bcrypt = require('bcrypt')
const {
  ERROR,
  SUCCESS
} = require('../util/util')
class UserService extends Service {
  async create(user) {
    const {
      ctx
    } = this
    try {
      if (!user.username || !user.password) {
        ctx.status = 400
        return Object.assign(ERROR, {
          msg: `expected an object with username, password but got: ${JSON.stringify(user)}`
        })
      }
      const saltRounds = 10
      const salt = bcrypt.genSaltSync(saltRounds)
      const hash = bcrypt.hashSync(user.password, salt)
      user = Object.assign(user, {
        password: hash
      })
      const userDB = await ctx.model.User.findOne({
        where: {
          username: user.username
        }
      })
      if(!userDB) {
        const res = await this.ctx.model.User.create(user)
        ctx.status = 201
        return Object.assign(SUCCESS, {
          data: res
        })
      } else {
        ctx.status = 406
        return Object.assign(ERROR, {
          msg: 'username already exists'
        })
      }
    } catch (error) {
      ctx.throw(500)
    }
  }

  async del(id) {
    const {
      ctx
    } = this
    try {
      const user = await ctx.model.User.findById(id)
      if (!user) {
        ctx.status = 400
        return Object.assign(ERROR, {
          msg: 'user not found'
        })
      } else {
        user.destroy()
        ctx.status = 200
        return Object.assign(SUCCESS, {
          data: user
        })
      }
    } catch (error) {
      ctx.throw(500)
    }
    
  }
}

module.exports = UserService