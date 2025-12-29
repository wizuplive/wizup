# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetCommunityBySlug*](#getcommunitybyslug)
  - [*ListPostsByCommunity*](#listpostsbycommunity)
- [**Mutations**](#mutations)
  - [*CreateCommunity*](#createcommunity)
  - [*CreatePost*](#createpost)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetCommunityBySlug
You can execute the `GetCommunityBySlug` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCommunityBySlug(vars: GetCommunityBySlugVariables): QueryPromise<GetCommunityBySlugData, GetCommunityBySlugVariables>;

interface GetCommunityBySlugRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCommunityBySlugVariables): QueryRef<GetCommunityBySlugData, GetCommunityBySlugVariables>;
}
export const getCommunityBySlugRef: GetCommunityBySlugRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCommunityBySlug(dc: DataConnect, vars: GetCommunityBySlugVariables): QueryPromise<GetCommunityBySlugData, GetCommunityBySlugVariables>;

interface GetCommunityBySlugRef {
  ...
  (dc: DataConnect, vars: GetCommunityBySlugVariables): QueryRef<GetCommunityBySlugData, GetCommunityBySlugVariables>;
}
export const getCommunityBySlugRef: GetCommunityBySlugRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCommunityBySlugRef:
```typescript
const name = getCommunityBySlugRef.operationName;
console.log(name);
```

### Variables
The `GetCommunityBySlug` query requires an argument of type `GetCommunityBySlugVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCommunityBySlugVariables {
  slug: string;
}
```
### Return Type
Recall that executing the `GetCommunityBySlug` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCommunityBySlugData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCommunityBySlugData {
  communities: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    rules?: string | null;
    welcomeMessage?: string | null;
    bannerImageURL?: string | null;
    creator: {
      id: UUIDString;
      username: string;
      displayName?: string | null;
      profilePictureURL?: string | null;
    } & User_Key;
  } & Community_Key)[];
}
```
### Using `GetCommunityBySlug`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCommunityBySlug, GetCommunityBySlugVariables } from '@dataconnect/generated';

// The `GetCommunityBySlug` query requires an argument of type `GetCommunityBySlugVariables`:
const getCommunityBySlugVars: GetCommunityBySlugVariables = {
  slug: ..., 
};

// Call the `getCommunityBySlug()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCommunityBySlug(getCommunityBySlugVars);
// Variables can be defined inline as well.
const { data } = await getCommunityBySlug({ slug: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCommunityBySlug(dataConnect, getCommunityBySlugVars);

console.log(data.communities);

// Or, you can use the `Promise` API.
getCommunityBySlug(getCommunityBySlugVars).then((response) => {
  const data = response.data;
  console.log(data.communities);
});
```

### Using `GetCommunityBySlug`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCommunityBySlugRef, GetCommunityBySlugVariables } from '@dataconnect/generated';

// The `GetCommunityBySlug` query requires an argument of type `GetCommunityBySlugVariables`:
const getCommunityBySlugVars: GetCommunityBySlugVariables = {
  slug: ..., 
};

// Call the `getCommunityBySlugRef()` function to get a reference to the query.
const ref = getCommunityBySlugRef(getCommunityBySlugVars);
// Variables can be defined inline as well.
const ref = getCommunityBySlugRef({ slug: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCommunityBySlugRef(dataConnect, getCommunityBySlugVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.communities);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.communities);
});
```

## ListPostsByCommunity
You can execute the `ListPostsByCommunity` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPostsByCommunity(vars: ListPostsByCommunityVariables): QueryPromise<ListPostsByCommunityData, ListPostsByCommunityVariables>;

interface ListPostsByCommunityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPostsByCommunityVariables): QueryRef<ListPostsByCommunityData, ListPostsByCommunityVariables>;
}
export const listPostsByCommunityRef: ListPostsByCommunityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPostsByCommunity(dc: DataConnect, vars: ListPostsByCommunityVariables): QueryPromise<ListPostsByCommunityData, ListPostsByCommunityVariables>;

interface ListPostsByCommunityRef {
  ...
  (dc: DataConnect, vars: ListPostsByCommunityVariables): QueryRef<ListPostsByCommunityData, ListPostsByCommunityVariables>;
}
export const listPostsByCommunityRef: ListPostsByCommunityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPostsByCommunityRef:
```typescript
const name = listPostsByCommunityRef.operationName;
console.log(name);
```

### Variables
The `ListPostsByCommunity` query requires an argument of type `ListPostsByCommunityVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListPostsByCommunityVariables {
  communityId: UUIDString;
}
```
### Return Type
Recall that executing the `ListPostsByCommunity` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPostsByCommunityData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPostsByCommunityData {
  posts: ({
    id: UUIDString;
    title?: string | null;
    content: string;
    mediaURL?: string | null;
    postType?: string | null;
    author: {
      id: UUIDString;
      username: string;
      displayName?: string | null;
      profilePictureURL?: string | null;
    } & User_Key;
  } & Post_Key)[];
}
```
### Using `ListPostsByCommunity`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPostsByCommunity, ListPostsByCommunityVariables } from '@dataconnect/generated';

// The `ListPostsByCommunity` query requires an argument of type `ListPostsByCommunityVariables`:
const listPostsByCommunityVars: ListPostsByCommunityVariables = {
  communityId: ..., 
};

// Call the `listPostsByCommunity()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPostsByCommunity(listPostsByCommunityVars);
// Variables can be defined inline as well.
const { data } = await listPostsByCommunity({ communityId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPostsByCommunity(dataConnect, listPostsByCommunityVars);

console.log(data.posts);

// Or, you can use the `Promise` API.
listPostsByCommunity(listPostsByCommunityVars).then((response) => {
  const data = response.data;
  console.log(data.posts);
});
```

### Using `ListPostsByCommunity`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPostsByCommunityRef, ListPostsByCommunityVariables } from '@dataconnect/generated';

// The `ListPostsByCommunity` query requires an argument of type `ListPostsByCommunityVariables`:
const listPostsByCommunityVars: ListPostsByCommunityVariables = {
  communityId: ..., 
};

// Call the `listPostsByCommunityRef()` function to get a reference to the query.
const ref = listPostsByCommunityRef(listPostsByCommunityVars);
// Variables can be defined inline as well.
const ref = listPostsByCommunityRef({ communityId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPostsByCommunityRef(dataConnect, listPostsByCommunityVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.posts);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.posts);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateCommunity
You can execute the `CreateCommunity` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCommunity(vars: CreateCommunityVariables): MutationPromise<CreateCommunityData, CreateCommunityVariables>;

interface CreateCommunityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCommunityVariables): MutationRef<CreateCommunityData, CreateCommunityVariables>;
}
export const createCommunityRef: CreateCommunityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCommunity(dc: DataConnect, vars: CreateCommunityVariables): MutationPromise<CreateCommunityData, CreateCommunityVariables>;

interface CreateCommunityRef {
  ...
  (dc: DataConnect, vars: CreateCommunityVariables): MutationRef<CreateCommunityData, CreateCommunityVariables>;
}
export const createCommunityRef: CreateCommunityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCommunityRef:
```typescript
const name = createCommunityRef.operationName;
console.log(name);
```

### Variables
The `CreateCommunity` mutation requires an argument of type `CreateCommunityVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateCommunityVariables {
  name: string;
  slug: string;
  description: string;
  rules: string;
  welcomeMessage: string;
  bannerImageURL?: string | null;
}
```
### Return Type
Recall that executing the `CreateCommunity` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCommunityData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCommunityData {
  community_insert: Community_Key;
}
```
### Using `CreateCommunity`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCommunity, CreateCommunityVariables } from '@dataconnect/generated';

// The `CreateCommunity` mutation requires an argument of type `CreateCommunityVariables`:
const createCommunityVars: CreateCommunityVariables = {
  name: ..., 
  slug: ..., 
  description: ..., 
  rules: ..., 
  welcomeMessage: ..., 
  bannerImageURL: ..., // optional
};

// Call the `createCommunity()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCommunity(createCommunityVars);
// Variables can be defined inline as well.
const { data } = await createCommunity({ name: ..., slug: ..., description: ..., rules: ..., welcomeMessage: ..., bannerImageURL: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCommunity(dataConnect, createCommunityVars);

console.log(data.community_insert);

// Or, you can use the `Promise` API.
createCommunity(createCommunityVars).then((response) => {
  const data = response.data;
  console.log(data.community_insert);
});
```

### Using `CreateCommunity`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCommunityRef, CreateCommunityVariables } from '@dataconnect/generated';

// The `CreateCommunity` mutation requires an argument of type `CreateCommunityVariables`:
const createCommunityVars: CreateCommunityVariables = {
  name: ..., 
  slug: ..., 
  description: ..., 
  rules: ..., 
  welcomeMessage: ..., 
  bannerImageURL: ..., // optional
};

// Call the `createCommunityRef()` function to get a reference to the mutation.
const ref = createCommunityRef(createCommunityVars);
// Variables can be defined inline as well.
const ref = createCommunityRef({ name: ..., slug: ..., description: ..., rules: ..., welcomeMessage: ..., bannerImageURL: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCommunityRef(dataConnect, createCommunityVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.community_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.community_insert);
});
```

## CreatePost
You can execute the `CreatePost` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPost(vars: CreatePostVariables): MutationPromise<CreatePostData, CreatePostVariables>;

interface CreatePostRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePostVariables): MutationRef<CreatePostData, CreatePostVariables>;
}
export const createPostRef: CreatePostRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPost(dc: DataConnect, vars: CreatePostVariables): MutationPromise<CreatePostData, CreatePostVariables>;

interface CreatePostRef {
  ...
  (dc: DataConnect, vars: CreatePostVariables): MutationRef<CreatePostData, CreatePostVariables>;
}
export const createPostRef: CreatePostRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPostRef:
```typescript
const name = createPostRef.operationName;
console.log(name);
```

### Variables
The `CreatePost` mutation requires an argument of type `CreatePostVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePostVariables {
  communityId: UUIDString;
  title?: string | null;
  content: string;
  mediaURL?: string | null;
  postType?: string | null;
}
```
### Return Type
Recall that executing the `CreatePost` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePostData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePostData {
  post_insert: Post_Key;
}
```
### Using `CreatePost`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPost, CreatePostVariables } from '@dataconnect/generated';

// The `CreatePost` mutation requires an argument of type `CreatePostVariables`:
const createPostVars: CreatePostVariables = {
  communityId: ..., 
  title: ..., // optional
  content: ..., 
  mediaURL: ..., // optional
  postType: ..., // optional
};

// Call the `createPost()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPost(createPostVars);
// Variables can be defined inline as well.
const { data } = await createPost({ communityId: ..., title: ..., content: ..., mediaURL: ..., postType: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPost(dataConnect, createPostVars);

console.log(data.post_insert);

// Or, you can use the `Promise` API.
createPost(createPostVars).then((response) => {
  const data = response.data;
  console.log(data.post_insert);
});
```

### Using `CreatePost`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPostRef, CreatePostVariables } from '@dataconnect/generated';

// The `CreatePost` mutation requires an argument of type `CreatePostVariables`:
const createPostVars: CreatePostVariables = {
  communityId: ..., 
  title: ..., // optional
  content: ..., 
  mediaURL: ..., // optional
  postType: ..., // optional
};

// Call the `createPostRef()` function to get a reference to the mutation.
const ref = createPostRef(createPostVars);
// Variables can be defined inline as well.
const ref = createPostRef({ communityId: ..., title: ..., content: ..., mediaURL: ..., postType: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPostRef(dataConnect, createPostVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.post_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.post_insert);
});
```

