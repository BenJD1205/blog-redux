import { createSlice, PayloadAction, AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit'
import { Post } from 'types/blog.type'
import http from 'utils/http'

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>

type PendingAction = ReturnType<GenericAsyncThunk['pending']>
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>

interface BlogState {
    postList: Post[]
    editingPost: Post | null
    loading: boolean
    currentRequestId: undefined | string
}

const initialState: BlogState = {
    postList: [],
    editingPost: null,
    loading: false,
    currentRequestId: undefined
}

export const getPostList = createAsyncThunk('blog/getPost',
    async (_, thunkAPI) => {
        const res = await http.get<Post[]>('posts', {
            signal: thunkAPI.signal
        })
        return res.data
    })

export const addPost = createAsyncThunk('blog/addPost', async (body: Omit<Post, 'id'>, thunkAPI) => {
    const res = await http.post<Post>('posts', body, {
        signal: thunkAPI.signal
    })
    return res.data
})

export const updatePost = createAsyncThunk(
    'blog/updatePost',
    async ({ postId, body }: { postId: string; body: Post }, thunkAPI) => {
        try {
            const res = await http.put<Post>(`posts/${postId}`, body, {
                signal: thunkAPI.signal
            })
            return res.data
        } catch (err: any) {
            if (err.name === 'AxiosError' && err.response.status === 422) {
                return thunkAPI.rejectWithValue(err.response.data)
            }
            throw err
        }
    })

export const deletePost = createAsyncThunk('blog/deletePost', async (postId: string, thunkAPI) => {
    const res = await http.delete<Post>(`posts/${postId}`, {
        signal: thunkAPI.signal
    })
    return res.data
})

const blogSlice = createSlice({
    name: 'blog',
    initialState,
    reducers: {
        startEditingPost: (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            const foundPost = state.postList.find((post) => post.id === postId) || null;
            state.editingPost = foundPost
        },
        cancelEditingPost: (state) => {
            state.editingPost = null;
        },
    },
    extraReducers(builder) {
        builder.addCase(getPostList.fulfilled, (state, action: any) => {
            state.postList = action.payload
        }).addCase(addPost.fulfilled, (state, action: any) => {
            state.postList.push(action.payload)
        }).addCase(updatePost.fulfilled, (state, action: any) => {
            state.postList.find((post, index) => {
                if (post.id === action.payload.id) {
                    state.postList[index] = action.payload
                    return true
                }
                return false
            })
            state.editingPost = null
        }).addCase(deletePost.fulfilled, (state, action) => {
            const postId = action.meta.arg
            const deletePostIndex = state.postList.findIndex((post) => post.id === postId)
            if (deletePostIndex !== -1) {
                state.postList.splice(deletePostIndex, 1)
            }
        }).addMatcher<PendingAction>((action) => action.type.endsWith('/pending'), (state, action) => {
            state.loading = true
            state.currentRequestId = action.meta.requestId
        }).addMatcher<RejectedAction>((action) => action.type.endsWith('/rejected'), (state, action) => {
            if (state.loading && state.currentRequestId === action.meta.requestId) {
                state.loading = false
            }
        }).addMatcher<FulfilledAction>((action) => action.type.endsWith('/fulfilled'), (state, action) => {
            if (state.loading && state.currentRequestId === action.meta.requestId) {
                state.loading = false
                state.currentRequestId = undefined
            }
        })
    }
})

export const { cancelEditingPost, startEditingPost } = blogSlice.actions
export default blogSlice.reducer

