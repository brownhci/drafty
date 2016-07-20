/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package drafty.util.commons.text.similarity;

/**
 * <p>
 * This stores a {@link EditDistance} implementation and a {@link CharSequence} "left" string.
 * The {@link #apply(CharSequence right)} method accepts the "right" string and invokes the
 * comparison function for the pair of strings.
 * </p>
 *
 * <p>
 * The following is an example which finds the most similar string:
 * </p>
 * <pre>
 * EditDistance&lt;Integer&gt; editDistance = new LevenshteinDistance();
 * String target = "Apache";
 * EditDistanceFrom&lt;Integer&gt; editDistanceFrom =
 *     new EditDistanceFrom&lt;Integer&gt;(editDistance, target);
 * String mostSimilar = null;
 * Integer shortestDistance = null;
 *
 * for (String test : new String[] { "Appaloosa", "a patchy", "apple" }) {
 *     Integer distance = editDistanceFrom.apply(test);
 *     if (shortestDistance == null || distance &lt; shortestDistance) {
 *         shortestDistance = distance;
 *         mostSimilar = test;
 *     }
 * }
 *
 * System.out.println("The string most similar to \"" + target + "\" "
 *     + "is \"" + mostSimilar + "\" because "
 *     + "its distance is only " + shortestDistance + ".");
 * </pre>
 *
 * @param <R> This is the type of similarity score used by the EditDistance function.
 */
public class EditDistanceFrom<R> {

    /**
     * Edit distance.
     */
    private final EditDistance<R> editDistance;
    /**
     * Left parameter used in distance function.
     */
    private final CharSequence left;

    /**
     * <p>This accepts the edit distance implementation and the "left" string.</p>
     *
     * @param editDistance This may not be null.
     * @param left This may be null here,
     *             but the EditDistance#compare(CharSequence left, CharSequence right)
     *             implementation may not accept nulls.
     */
    public EditDistanceFrom(final EditDistance<R> editDistance, final CharSequence left) {
        if (editDistance == null) {
            throw new IllegalArgumentException("The edit distance may not be null.");
        }

        this.editDistance = editDistance;
        this.left = left;
    }

    /**
     * <p>
     * This compares "left" field against the "right" parameter
     * using the "edit distance" implementation.
     * </p>
     *
     * @param right the second CharSequence
     * @return the similarity score between two CharSequences
     */
    public R apply(CharSequence right) {
        return editDistance.apply(left, right);
    }

    /**
     * Gets the left parameter.
     *
     * @return the left parameter
     */
    public CharSequence getLeft() {
        return left;
    }

    /**
     * Gets the edit distance.
     *
     * @return the edit distance
     */
    public EditDistance<R> getEditDistance() {
        return editDistance;
    }

}
