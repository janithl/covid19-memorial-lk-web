import { last } from 'lodash';
import Head from 'next/head'
import { useEffect, useRef, useState, useReducer } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import Entry from '../components/Entry';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { intersectHook } from '../utils/hooks';
import { fetchEntries } from '../utils/queries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { useIntl, useTranslations } from 'use-intl';
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote } from 'next-mdx-remote'
import Filter from '../components/Filter';
import { filterInitialState, filterReducer } from '../utils/reducers';

export default function Home(props) {

  const queryClient = useQueryClient()
  const loader = useRef(null);
  const t = useTranslations('home');
  const intl = useIntl();

  const [items, setItems] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [filter, filterDispatch] = useReducer(filterReducer, filterInitialState);

  // On Entry Query Success
  const onSuccess = (data) => {
    // Clear Page If New Page
    if (filter.page == 0){
      setItems(data.data); 
    } else {
      setItems((items) => [...items, ...data.data]);
    }
    // Prefetch and set has next flag.
    if (data.links.next){
      setHasNext(true);
      const mutatedFilter = {
        ...filter,
        page: filter.page + 1
      }
      queryClient.prefetchQuery(['entries', JSON.stringify(mutatedFilter)], () => fetchEntries(mutatedFilter));
    } else {
      setHasNext(false);
    }
  }

  // Fetch Entries, on initial offset use rendered dataset.
  const { status, data, isFetching } = useQuery(['entries', JSON.stringify(filter)],
    () => (fetchEntries(filter)),
    { keepPreviousData: true, staleTime: 5000, onSuccess: onSuccess}
  )

  //When user is near intersecting end.
  // intersectHook(()=> {
  //   if (hasNext) {
  //     filterDispatch({ type: "PAGE_UP"});
  //   }
  // }, "30%", loader);

  return (
    <>
      <Head>
        <title>COVID-19 Memorial</title>
      </Head>

      <Header />
      <main className={"md:container min-h-screen mx-auto px-4 py-1 mb-4 relative"}>
        <div className="bg-base-300 rounded-xl my-1 lg:my-4">
          <div className="card">
            <div className="card-body text-sm md:text-base">
              <div className={"prose prose-sm max-w-none"}>
                <MDXRemote {...props.indexText} scope={{
                  total: intl.formatNumber(props.cumDeaths),
                  count: intl.formatNumber(props.count)
                }}/>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-1">
          <Filter filter={filter} dispatch={filterDispatch}/>
        </div>
        {items.length == 0 && !isFetching ? (<div className="p-8 text-center text-lg font-semibold">
          <p>{t('noResults')}</p>
        </div>): (
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 xl:grid-cols-10 gap-2">
            {items.map((i) => (<Entry key={i.id} data={i}/>))}
          </div>
        )}
        <div ref={loader} className="text-center py-8">
          <button class={`btn btn-md ${isFetching ? 'loading' : ''}`} onClick={()=>{filterDispatch({ type: "PAGE_UP"})}} disabled={!hasNext}>
            {isFetching ? t('loading') : "Load More"}
          </button>
        </div>
      </main>
      {/* {isFetching ? (
        <div className="text-center text-lg font-semibold p-4">
            <FontAwesomeIcon className="animate-spin w-5 h-5" icon={faSpinner} />
            <p>{t('loading')}</p>
        </div>) : []
      } */}
      <Footer/>
    </>
  )
}

export async function getStaticProps({locale}) {
  const rawData = require('../data/latest.json');
  const keyData = require('../data/keys_latest.json');
  // Load Intro Text
  const fs = require('fs')
  const source = fs.readFileSync(`data/content/index_${locale}.mdx`, {encoding:'utf8', flag:'r'});
  const mdxSource = await serialize(source)
  return {
    props: {
      count: rawData.length,
      cumDeaths: last(keyData).cumDeaths,
      indexText: mdxSource,
      messages: {
        ...require(`../lang/${locale}.json`),
      },
    }
  };
}