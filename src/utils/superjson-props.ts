import superjson from 'superjson';

type SerializedProps = Record<string, unknown> & { _superjson?: unknown };

/**
 * Lets `getStaticProps` / `getServerSideProps` return non-JSON values (Date etc.).
 * The props are revived again in `_app.tsx` with `deserializeProps`.
 */
export function withSuperJSONProps<
  Args extends unknown[],
  Result extends object,
>(getProps: (...args: Args) => Promise<Result>) {
  return async function withSuperJSON(...args: Args): Promise<Result> {
    const result = await getProps(...args);
    if (!('props' in result) || !result.props) {
      return result;
    }
    const { json, meta } = superjson.serialize(result.props);
    return {
      ...result,
      props: meta ? { ...(json as object), _superjson: meta } : json,
    };
  };
}

export function deserializeProps<Props extends SerializedProps>(
  serializedProps: Props
): Props {
  const { _superjson, ...props } = serializedProps;
  if (!_superjson) {
    return serializedProps;
  }
  return superjson.deserialize({
    json: props,
    meta: _superjson,
  } as Parameters<typeof superjson.deserialize>[0]);
}
