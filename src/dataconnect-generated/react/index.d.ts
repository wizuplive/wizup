import { CreateCommunityData, CreateCommunityVariables, GetCommunityBySlugData, GetCommunityBySlugVariables, CreatePostData, CreatePostVariables, ListPostsByCommunityData, ListPostsByCommunityVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateCommunity(options?: useDataConnectMutationOptions<CreateCommunityData, FirebaseError, CreateCommunityVariables>): UseDataConnectMutationResult<CreateCommunityData, CreateCommunityVariables>;
export function useCreateCommunity(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCommunityData, FirebaseError, CreateCommunityVariables>): UseDataConnectMutationResult<CreateCommunityData, CreateCommunityVariables>;

export function useGetCommunityBySlug(vars: GetCommunityBySlugVariables, options?: useDataConnectQueryOptions<GetCommunityBySlugData>): UseDataConnectQueryResult<GetCommunityBySlugData, GetCommunityBySlugVariables>;
export function useGetCommunityBySlug(dc: DataConnect, vars: GetCommunityBySlugVariables, options?: useDataConnectQueryOptions<GetCommunityBySlugData>): UseDataConnectQueryResult<GetCommunityBySlugData, GetCommunityBySlugVariables>;

export function useCreatePost(options?: useDataConnectMutationOptions<CreatePostData, FirebaseError, CreatePostVariables>): UseDataConnectMutationResult<CreatePostData, CreatePostVariables>;
export function useCreatePost(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePostData, FirebaseError, CreatePostVariables>): UseDataConnectMutationResult<CreatePostData, CreatePostVariables>;

export function useListPostsByCommunity(vars: ListPostsByCommunityVariables, options?: useDataConnectQueryOptions<ListPostsByCommunityData>): UseDataConnectQueryResult<ListPostsByCommunityData, ListPostsByCommunityVariables>;
export function useListPostsByCommunity(dc: DataConnect, vars: ListPostsByCommunityVariables, options?: useDataConnectQueryOptions<ListPostsByCommunityData>): UseDataConnectQueryResult<ListPostsByCommunityData, ListPostsByCommunityVariables>;
