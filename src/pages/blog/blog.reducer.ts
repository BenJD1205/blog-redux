import { createReducer, createAction, current } from '@reduxjs/toolkit'
import { Post } from 'types/blog.type'
import { initalPostList } from 'constants/blog'

interface BlogState {
    postList: Post[]
    editingPost: Post | null
}

const initalState: BlogState = {
    postList: initalPostList,
    editingPost: null
}

export const addPost = createAction<Post>('blog/addPost')
export const deletePost = createAction<Post>('blog/deletePost')
export const startEditingPost = createAction<string>('blog/startEditingPost')
export const cancelEditingPost = createAction('blog/cancelEditingPost')
export const finishEditingPost = createAction<Post>('blog/finishEditingPost')

const blogReducer = createReducer(initalState, (builder) => {
    builder
        .addCase(addPost, (state, action) => {
            //immerjs
            //immerjs giúp chúng ta mutate một state an toàn
            state.postList.push(action.payload)
        })
        .addCase(deletePost, (state, action) => {
            const postId = action.payload
            const foundPostIndex = state.postList.findIndex((post) => post.id === post.id)
            if (foundPostIndex !== -1) {
                state.postList.splice(foundPostIndex, 1)
            }
        })
        .addCase(startEditingPost, (state, action) => {
            const postId = action.payload;
            const foundPost = state.postList.find((post) => post.id === postId) || null;
            state.editingPost = foundPost
        }).addCase(cancelEditingPost, (state, action) => {
            state.editingPost = null
        })
        .addCase(finishEditingPost, (state, action) => {
            const postId = action.payload.id;
            state.postList.some((post, index) => {
                if (post.id === postId) {
                    state.postList[index] = action.payload
                    return true
                }
                return false
            })

        }).addMatcher((action) => action.type.includes('cancel'), (state, action) => {
            console.log(current(state))
        })
})

export default blogReducer
