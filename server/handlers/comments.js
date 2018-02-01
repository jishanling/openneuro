import config from '../config'
import request from '../libs/request'
import crypto from 'crypto'
import mongo from '../libs/mongo'
import {ObjectID} from 'mongodb'

let c = mongo.collections

// handlers ----------------------------------------------------------------

/**
 * Comments
 *
 * Handlers for comment actions. 
 */

export default {
  // write
  /**
  * Create Comment
  *
  * Creates an entry in the comments database, 
  * ** maybe returns the newly created comment id
  */
  create(req, res, next) {
    console.log('server/handlers/comments/create with data:', req.body, req.params.datasetId)
    let comment = req.body
    let datasetId = req.params.datasetId

    c.crn.comments.insertOne(comment, (err, response) => {
      console.log('server err:', err, 'server response:', response)
      if (err) {
        return next(err)
      }
      res.send(response.ops)
    })
  },

  /**
   * Delete Comment
   * 
   * Removes an entry in the comments database, as well as any
   * replies to a comment
   */
  delete(req, res, next) {
    console.log('server/handlers/comments/delete with req: ', req.body, 'and params:', req.params)
    const commentId = req.params.commentId
    const parentId = req.body.parentId

    console.log('deleting an entry in the mongo db with commentId:', commentId, 'and parentId:', parentId)
    // delete the comment in question
    c.crn.comments.deleteOne(
      { _id: ObjectID(commentId)},
      err => {
        if (err) {
          return next(err)
        }

        console.log('successfully deleted one comment...')
        console.log('deleting children of said comment...')
        // delete the children of that comment
        if (parentId) {
          c.crn.comments.deleteMany(
            { parentId: commentId},
            err => {
              if (err) {
                return next(err)
              }
              console.log('successfully deleted the children of that comment.')
              return res.send()
            },
          )
        }
        return res.send()
      },
    )
  },

  // read ------------------------------------------

  /**
  * Get Comments
  *
  * Returns a list of comments that are associated with a dataset
  */
  getComments(req, res, next) {
      console.log('/server/handlers/comments.js getComments')
    let datasetId = req.params.datasetId

    c.crn.comments
      .find({
        datasetId: datasetId,
      })
      .toArray((err, comments) => {
        if (err) {
          return next(err)
        }
        res.send(comments)
      })
  },
}